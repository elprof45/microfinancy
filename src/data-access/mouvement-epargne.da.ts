import { prisma } from '../../lib/db'

// ─── MouvementEpargne ───────────────────────────────────────────────────────
export const findAllMouvementEpargnes = () =>
    prisma.mouvementEpargne.findMany({
        include: {
            agence: true,
            client: true,
            compte: true,
            creePar: true,
            validePar: true,
            cotisation: true,
            mouvementTotine: true,
        },
    })

export const findMouvementEpargneById = (id: number) =>
    prisma.mouvementEpargne.findUnique({
        where: { id },
        include: {
            agence: true,
            client: true,
            compte: true,
            creePar: true,
            validePar: true,
            cotisation: true,
            mouvementTotine: true,
        },
    })

export const createMouvementEpargne = (data: any) =>
    prisma.mouvementEpargne.create({ data })

export const updateMouvementEpargne = (id: number, data: any) =>
    prisma.mouvementEpargne.update({ where: { id }, data })

export const deleteMouvementEpargne = (id: number) =>
    prisma.mouvementEpargne.delete({ where: { id } })

export const statsMouvementEpargne = async (id: number) => {
    const mouvement = await prisma.mouvementEpargne.findUnique({
        where: { id },
        include: { compte: true, client: true, agence: true, cotisation: true, mouvementTotine: true },
    })
    if (!mouvement) return null

    return {
        id: mouvement.id,
        reference: mouvement.reference,
        type: mouvement.type,
        montant: mouvement.montant,
        statut: mouvement.statut,
        dateMouvement: mouvement.dateMouvement,
        agenceId: mouvement.agenceId,
        compteId: mouvement.compteId,
        clientId: mouvement.clientId,
        cotisationId: mouvement.cotisationId,
        mouvementTotineId: mouvement.mouvementTotineId,
        creeParId: mouvement.creeParId,
        valideParId: mouvement.valideParId,
        compteNumero: mouvement.compte?.numeroCompte,
        clientNom: mouvement.client?.nom,
        agenceNom: mouvement.agence?.nom,
        cotisationMois: mouvement.cotisation?.mois,
        isValide: mouvement.statut === 'VALIDE',
    }
}

export const historyMouvementEpargne = async (id: number) => {
    const mouvement = await prisma.mouvementEpargne.findUnique({
        where: { id },
        include: {
            compte: true,
            client: true,
            agence: true,
            cotisation: true,
            mouvementTotine: true,
        },
    })
    if (!mouvement) return null

    const relatedCompteMouvements = mouvement.compteId
        ? await prisma.mouvementItem.findMany({
              where: { compteId: mouvement.compteId },
              orderBy: { date: 'desc' },
          })
        : []

    return {
        mouvement,
        relatedMouvementItems: relatedCompteMouvements,
    }
}
