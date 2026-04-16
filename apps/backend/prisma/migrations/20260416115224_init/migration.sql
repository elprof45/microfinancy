-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ADMIN', 'CAISSIER', 'COLLECTEUR');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('VERSEMENT', 'RETRAIT', 'DEPOT');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE', 'ANNULE', 'REMBOURSE');

-- CreateTable
CREATE TABLE "Societe" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "raisonSociale" TEXT,
    "identifiant" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "zoneId" INTEGER,
    "societeId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "societeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'CAISSIER',
    "societeId" INTEGER,
    "agenceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientEpargne" (
    "id" SERIAL NOT NULL,
    "numeroClient" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "pieceIdentite" TEXT,
    "agenceId" INTEGER,
    "deviseId" TEXT NOT NULL DEFAULT 'XOF',
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientEpargne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compte" (
    "id" SERIAL NOT NULL,
    "numeroCompte" TEXT NOT NULL,
    "typeCompte" TEXT NOT NULL,
    "solde" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "soldeDisponible" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dateOuverture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateCloture" TIMESTAMP(3),
    "clientId" INTEGER,
    "agenceId" INTEGER NOT NULL,
    "deviseId" TEXT NOT NULL,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementEpargne" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "soldeAvant" DECIMAL(65,30) NOT NULL,
    "soldeApres" DECIMAL(65,30) NOT NULL,
    "dateMouvement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'EN_ATTENTE',
    "observations" TEXT,
    "agenceId" INTEGER NOT NULL,
    "clientId" INTEGER,
    "compteId" INTEGER,
    "creeParId" INTEGER NOT NULL,
    "valideParId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MouvementEpargne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementItem" (
    "id" SERIAL NOT NULL,
    "reference" TEXT,
    "type" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "compteId" INTEGER,
    "caissierId" INTEGER,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'VALIDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Societe_identifiant_key" ON "Societe"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_code_key" ON "Agence"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_code_key" ON "Zone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientEpargne_numeroClient_key" ON "ClientEpargne"("numeroClient");

-- CreateIndex
CREATE UNIQUE INDEX "Compte_numeroCompte_key" ON "Compte"("numeroCompte");

-- CreateIndex
CREATE UNIQUE INDEX "MouvementEpargne_reference_key" ON "MouvementEpargne"("reference");

-- AddForeignKey
ALTER TABLE "Agence" ADD CONSTRAINT "Agence_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agence" ADD CONSTRAINT "Agence_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_agenceId_caissier_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_agenceId_collecteur_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEpargne" ADD CONSTRAINT "ClientEpargne_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compte" ADD CONSTRAINT "Compte_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientEpargne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compte" ADD CONSTRAINT "Compte_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementEpargne" ADD CONSTRAINT "MouvementEpargne_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementEpargne" ADD CONSTRAINT "MouvementEpargne_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientEpargne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementEpargne" ADD CONSTRAINT "MouvementEpargne_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementEpargne" ADD CONSTRAINT "MouvementEpargne_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementItem" ADD CONSTRAINT "MouvementItem_caissierId_fkey" FOREIGN KEY ("caissierId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementItem" ADD CONSTRAINT "MouvementItem_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;
