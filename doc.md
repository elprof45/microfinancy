Voici une proposition de structure de base pour organiser tes **opérations CRUD** (et quelques actions métier) en TypeScript avec **Prisma Client**, en respectant ton schéma.

Je vais te montrer :

- L'organisation recommandée des fichiers
- Les types de base / enums
- Exemples de services pour les entités les plus importantes
- Quelques fonctions métier typiques

### Organisation recommandée des fichiers

```
src/
├── prisma/
│   └── schema.prisma
├── generated/
│   └── prisma/           ← output du client prisma
├── types/
│   ├── prisma.types.ts   ← exports des types Prisma + enums custom
│   └── index.ts
├── services/
│   ├── base.service.ts
│   ├── societe.service.ts
│   ├── agence.service.ts
│   ├── utilisateur.service.ts
│   ├── client-epargne.service.ts
│   ├── compte.service.ts
│   ├── mouvement-epargne.service.ts
│   ├── etat-caisse.service.ts
│   ├── caisse.service.ts       ← logique caisse / pointage
│   └── index.ts
├── utils/
│   └── error-handler.ts
└── ...
```

### 1. Types de base (types/prisma.types.ts)

```ts
import { 
  RoleUtilisateur,
  TypeMouvement,
  SensMouvement,
  StatutCaisse,
  StatutTransaction,
  Prisma,
  Societe,
  Agence,
  Utilisateur,
  ClientEpargne,
  Compte,
  MouvementEpargne,
  EtatCaisse,
  MouvementItem,
  AuditLog,
  ParametreSociete,
} from "@prisma/client";

export {
  RoleUtilisateur,
  TypeMouvement,
  SensMouvement,
  StatutCaisse,
  StatutTransaction,
  Prisma,
};

// Types utiles pour les inputs / create / update
export type SocieteCreateInput = Prisma.SocieteCreateInput;
export type SocieteUpdateInput = Prisma.SocieteUpdateInput;

export type UtilisateurCreateInput = Prisma.UtilisateurCreateInput & {
  motDePasse?: string; // on acceptera le mot de passe en clair puis on le hashera
};

export type MouvementEpargneCreateBusinessInput = {
  reference?: string;
  type: TypeMouvement;
  sens: SensMouvement;
  montant: number | string | Prisma.Decimal;
  observations?: string;
  compteId: number;
  agenceId: number;
  creeParId: number;
  // optionnel selon le type
  clientId?: number;
};

export type PointageCaisseInput = {
  etatCaisseId: number;
  soldeFinalReel: number | string | Prisma.Decimal;
  observations?: string;
  valideParId: number;
};
```

### 2. Service de base (services/base.service.ts)

```ts
import { PrismaClient } from "@prisma/client";

export abstract class BaseService<T, C, U> {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findMany(args?: any): Promise<T[]> {
    return this.prisma[this.modelName].findMany(args);
  }

  async findUnique(where: any): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({ where });
  }

  async create(data: C): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  async update(where: any, data: U): Promise<T> {
    return this.prisma[this.modelName].update({ where, data });
  }

  async delete(where: any): Promise<T> {
    return this.prisma[this.modelName].delete({ where });
  }

  // À surcharger dans chaque service
  protected abstract get modelName(): keyof PrismaClient;
}
```

### 3. Exemple concret : UtilisateurService

```ts
// services/utilisateur.service.ts
import { PrismaClient, Utilisateur, RoleUtilisateur } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BaseService } from "./base.service";
import type { UtilisateurCreateInput } from "../types/prisma.types";

export class UtilisateurService extends BaseService<Utilisateur, any, any> {
  protected get modelName() {
    return "utilisateur" as keyof PrismaClient;
  }

  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async createUtilisateur(data: UtilisateurCreateInput & { motDePasse: string }): Promise<Utilisateur> {
    const hash = await bcrypt.hash(data.motDePasse, 12);

    return this.prisma.utilisateur.create({
      data: {
        ...data,
        motDePasseHash: hash,
        motDePasse: undefined, // sécurité
      },
    });
  }

  async findByEmailWithRole(email: string): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: {
        societe: true,
        agence: true,
      },
    });
  }

  async changeRole(userId: number, newRole: RoleUtilisateur, updatedBy: number): Promise<Utilisateur> {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        role: newRole,
        updatedBy,
      },
    });
  }

  async deactivate(userId: number, reason?: string): Promise<Utilisateur> {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        // on peut stocker la raison dans un champ observations si vous l'ajoutez
      },
    });
  }
}
```

### 4. Mouvement d'épargne – logique métier importante

```ts
// services/mouvement-epargne.service.ts
import { PrismaClient, TypeMouvement, SensMouvement, StatutTransaction } from "@prisma/client";
import { BaseService } from "./base.service";
import type { MouvementEpargneCreateBusinessInput } from "../types/prisma.types";

export class MouvementEpargneService extends BaseService<any, any, any> {
  protected get modelName() {
    return "mouvementEpargne" as keyof PrismaClient;
  }

  async creerMouvement(input: MouvementEpargneCreateBusinessInput) {
    const { compteId, montant, sens, type, creeParId, agenceId, clientId } = input;

    return this.prisma.$transaction(async (tx) => {
      // 1. Récupérer le compte
      const compte = await tx.compte.findUniqueOrThrow({
        where: { id: compteId },
        select: { solde: true, soldeDisponible: true, agenceId: true, isActif: true },
      });

      if (!compte.isActif) throw new Error("Compte inactif");

      // Vérification cohérence agence
      if (compte.agenceId !== agenceId) {
        throw new Error("Le compte n'appartient pas à cette agence");
      }

      const montantDecimal = new Prisma.Decimal(montant);

      // Calcul solde théorique après mouvement
      let soldeApres = compte.solde;
      let soldeDispoApres = compte.soldeDisponible;

      if (sens === SensMouvement.CREDIT) {
        soldeApres = soldeApres.add(montantDecimal);
        soldeDispoApres = soldeDispoApres.add(montantDecimal);
      } else {
        soldeApres = soldeApres.sub(montantDecimal);
        soldeDispoApres = soldeDispoApres.sub(montantDecimal);

        if (soldeDispoApres.lessThan(0)) {
          throw new Error("Solde insuffisant");
        }
      }

      // 2. Créer le mouvement
      const mouvement = await tx.mouvementEpargne.create({
        data: {
          reference: input.reference || `MVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type,
          sens,
          montant: montantDecimal,
          soldeAvant: compte.solde,
          soldeApres,
          statut: StatutTransaction.EN_ATTENTE,
          observations: input.observations,
          agenceId,
          clientId,
          compteId,
          creeParId,
        },
      });

      // 3. Mettre à jour le compte (selon politique : immédiat ou après validation)
      // → ici on met à jour immédiatement (cas le plus courant pour épargne)
      await tx.compte.update({
        where: { id: compteId },
        data: {
          solde: soldeApres,
          soldeDisponible: soldeDispoApres,
        },
      });

      return mouvement;
    });
  }

  async validerMouvement(mouvementId: number, valideParId: number) {
    return this.prisma.$transaction(async (tx) => {
      const mvt = await tx.mouvementEpargne.update({
        where: { id: mouvementId },
        data: {
          statut: StatutTransaction.VALIDE,
          valideParId,
        },
      });

      // Log d'audit, notification, etc...
      return mvt;
    });
  }
}
```

### 5. Pointage de caisse (exemple métier)

```ts
// services/caisse.service.ts
async pointageCaisse(input: PointageCaisseInput) {
  const { etatCaisseId, soldeFinalReel, valideParId } = input;

  return this.prisma.$transaction(async (tx) => {
    const etat = await tx.etatCaisse.findUniqueOrThrow({
      where: { id: etatCaisseId },
      include: { mouvements: true },
    });

    if (etat.statut !== StatutCaisse.OUVERTE) {
      throw new Error("Caisse n'est plus ouverte");
    }

    const reel = new Prisma.Decimal(soldeFinalReel);
    const ecart = reel.sub(etat.soldeFinalTheo);

    let nouveauStatut = StatutCaisse.POINTAGE_OK;
    if (ecart.abs().greaterThan(0.01)) {
      nouveauStatut = StatutCaisse.ECART;
    }

    return tx.etatCaisse.update({
      where: { id: etatCaisseId },
      data: {
        soldeFinalReel: reel,
        ecart,
        statut: nouveauStatut,
        observations: input.observations,
        // on peut ajouter validePar si vous ajoutez ce champ
      },
    });
  });
}
```

### Recommandations finales

Entités prioritaires à implémenter en premier :

1. Societe
2. Agence / Zone
3. Utilisateur + authentification
4. ClientEpargne
5. Compte
6. MouvementEpargne (la plus critique)
7. EtatCaisse + pointage
8. AuditLog (automatique via middleware prisma si possible)

Souhaites-tu que je développe en détail l’une de ces entités (avec validation zod, gestion des erreurs, droits d’accès selon rôle, etc.) ?

Ou préfères-tu un middleware prisma pour logger automatiquement les modifications sensibles ?

Bonne continuation !