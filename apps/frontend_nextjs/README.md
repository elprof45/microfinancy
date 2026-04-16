# Microfinancy - Interface d'administration Next.js

Interface de gestion complète pour Microfinancy, construite avec Next.js 16.2.4 et Tailwind CSS. 

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
cd apps/frontend_nextjs
npm install
# ou
bun install
```

### Configuration de l'API
Créer un fichier `.env` local :
```env
NEXT_PUBLIC_API_BASE=http://localhost:3030
```

### Lancer le serveur de développement
```bash
npm run dev
# ou
bun dev
```

L'interface sera disponible à [http://localhost:3000](http://localhost:3000)

## 📊 Fonctionnalités principales

### Gestion des ressources
- **Sociétés** (`/societes`) - Gestion des entités juridiques
- **Agences** (`/agences`) - Gestion des succursales
- **Utilisateurs** (`/users`) - Gestion des comptes et rôles
- **Comptes** (`/comptes`) - Gestion des comptes clients
- **Cotisations** (`/cotisations`) - Suivi des cotisations
- **Clients Totine** (`/client-totines`) - Gestion des clients Totine
- **Carnets** (`/carnets`) - Suivi des carnets de collecte
- **Mouvements épargne** (`/mouvement-epargnes`) - Enregistrement des mouvements d'épargne
- **Mouvements items** (`/mouvement-items`) - Suivi des dépôts/retraits
- **Soldes clients** (`/client-soldes`) - Consultation des soldes
- **Mouvements Totines** (`/mouvement-totines`) - Enregistrement des mouvements Totine

### Fonctionnalités principales
- ✅ CRUD complet pour toutes les ressources
- ✅ Validation de formulaires en temps réel
- ✅ Recherche multi-champs en live
- ✅ Pagination des listes
- ✅ Gestion des erreurs API
- ✅ Suivi de la santé des endpoints API
- ✅ Tableau de bord avec statistiques

## 🏗️ Architecture

### Répertoire
```
app/
  ├── page.tsx                    # Tableau de bord principal
  ├── layout.tsx                  # Layout global avec navigation
  ├── stats/page.tsx              # Page de statistiques API
  ├── [entity]/page.tsx           # Route dynamique pour les entités
  └── [ressource]/page.tsx        # Pages spécifiques pour chaque ressource
components/
  ├── EntityPage.tsx              # Composant générique pour CRUD
  └── ApiHealthTracker.tsx        # Suivi des endpoints API
lib/
  ├── api.ts                      # Client API et configurations
  ├── validation.ts               # Schémas et validations
  └── utils.ts                    # Utilitaires
```

### Flux de données
1. **Composant** → Appel API via `lib/api.ts`
2. **API Client** → Requête HTTP vers `http://localhost:3030`
3. **Backend** → Prisma + Base de données
4. **Réponse** → Formatée et affichée dans le composant

## 🔧 Configuration

### Variables d'environnement
| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_BASE` | URL du backend API | `http://localhost:3030` |

## 📝 Utilisation

### Accéder à une ressource
- Depuis le tableau de bord `/` 
- Via la navigation en haut (Sociétés, Agences, Utilisateurs, Comptes, Statistiques)
- Directement par URL : `/societes`, `/agences`, `/users`, etc.

### CRUD sur une ressource
1. **Lister** : Page ouvre avec tous les éléments
2. **Créer** : Bouton "Nouveau" → Remplir formulaire → Valider
3. **Éditer** : Clic "Modifier" → Modifier contenus → Valider
4. **Supprimer** : Clic "Supprimer" → Confirmation → Exécution

### Recherche
- Champ de recherche en haut de chaque liste
- Recherche en temps réel sur tous les champs
- Résultats filtrés instantanément

### Pagination
- Affichée si > 10 éléments par page
- Navigation "Précédent / Suivant"
- Affichage du nombre total d'éléments

## 🎨 Styles

L'interface utilise :
- **Tailwind CSS 4.x** pour le design
- **Lucide React** pour les icônes
- **Couleurs** : Slate (gris), Rose (erreurs), Emerald (succès)

## 🧪 Tests manuels

Voir le fichier `test_api.http` à la racine pour les exemples d'appels API.

### Exemple de flux
1. Créer une Société
2. Créer une Agence rattachée à cette Société
3. Créer un Utilisateur dans cette Agence
4. Consulter les statistiques API sur `/stats`

## 📦 Build pour production

```bash
npm run build
npm start
```

## 🔗 Accès API

Le frontend communique avec le backend Hono à `http://localhost:3030` exposant les endpoints :
- `GET /societes`
- `GET /agences`
- `GET /users`
- `GET /comptes`
- `GET /cotisations`
- Et plus...

Voir `apps/backend/src/index.ts` pour la configuration CORS.

## 📄 Licence

MIT

---

**Dernière mise à jour** : Avril 2026


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
