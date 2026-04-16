import { prisma } from '../../lib/db'

// ─── MouvementItem ─────────────────────────────────────────────────────────
export const findAllMouvementItems = () =>
    prisma.mouvementItem.findMany({
        include: {
            caissier: true,
            compte: true,
            cotisation: true,
            mouvementTotine: true,
        },
    })

export const findMouvementItemById = (id: number) =>
    prisma.mouvementItem.findUnique({
        where: { id },
        include: {
            caissier: true,
            compte: true,
            cotisation: true,
            mouvementTotine: true,
        },
    })

export const createMouvementItem = (data: any) =>
    prisma.mouvementItem.create({ data })

export const updateMouvementItem = (id: number, data: any) =>
    prisma.mouvementItem.update({ where: { id }, data })

export const deleteMouvementItem = (id: number) =>
    prisma.mouvementItem.delete({ where: { id } })

export const statsMouvementItem = async (id: number) => {
    const mouvement = await prisma.mouvementItem.findUnique({
        where: { id },
        include: { caissier: true, compte: true, cotisation: true, mouvementTotine: true },
    })
    if (!mouvement) return null

    return {
        id: mouvement.id,
        reference: mouvement.reference,
        type: mouvement.type,
        montant: mouvement.montant,
        date: mouvement.date,
        statut: mouvement.statut,
        compteId: mouvement.compteId,
        caissierId: mouvement.caissierId,
        cotisationId: mouvement.cotisationId,
        mouvementTotineId: mouvement.mouvementTotineId,
        compteNumero: mouvement.compte?.numeroCompte,
        caissierNom: mouvement.caissier?.nom,
        cotisationMois: mouvement.cotisation?.mois,
        isValide: mouvement.statut === 'VALIDE',
    }
}

export const historyMouvementItem = async (id: number) => {
    const mouvement = await prisma.mouvementItem.findUnique({
        where: { id },
        include: { caissier: true, compte: true, cotisation: true, mouvementTotine: true },
    })
    if (!mouvement) return null

    const relatedCompteMovements = mouvement.compteId
        ? await prisma.mouvementItem.findMany({
              where: { compteId: mouvement.compteId },
              orderBy: { date: 'desc' },
          })
        : []

    return {
        mouvement,
        relatedMouvementItems: relatedCompteMovements,
    }
}
