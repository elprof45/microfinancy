import { prisma } from '../../lib/db'

// ─── Compte ─────────────────────────────────────────────────────────────────
export const findAllComptes = () =>
    prisma.compte.findMany({
        include: {
            client: true,
            agence: true,
            mouvements: true,
            mouvementEpargnes: true,
        },
    })

export const findCompteById = (id: number) =>
    prisma.compte.findUnique({
        where: { id },
        include: {
            client: true,
            agence: true,
            mouvements: true,
            mouvementEpargnes: true,
        },
    })

export const createCompte = (data: any) => prisma.compte.create({ data })

export const updateCompte = (id: number, data: any) =>
    prisma.compte.update({ where: { id }, data })

export const deleteCompte = (id: number) => prisma.compte.delete({ where: { id } })

export const statsCompte = async (id: number) => {
    const compte = await prisma.compte.findUnique({
        where: { id },
        include: { mouvements: true, mouvementEpargnes: true },
    })
    if (!compte) return null

    const totalMouvementItems = compte.mouvements.length
    const totalMouvementEpargnes = compte.mouvementEpargnes.length
    const totalMontantItems = compte.mouvements.reduce((sum, item) => sum + Number(item.montant), 0)
    const totalMontantEpargnes = compte.mouvementEpargnes.reduce((sum, item) => sum + Number(item.montant), 0)

    return {
        id: compte.id,
        numeroCompte: compte.numeroCompte,
        typeCompte: compte.typeCompte,
        solde: compte.solde,
        soldeDisponible: compte.soldeDisponible,
        totalMouvementItems,
        totalMouvementEpargnes,
        totalMontantItems,
        totalMontantEpargnes,
        totalTransactions: totalMouvementItems + totalMouvementEpargnes,
    }
}

export const historyCompte = (id: number) =>
    prisma.compte.findUnique({
        where: { id },
        include: {
            mouvements: { orderBy: { date: 'desc' } },
            mouvementEpargnes: { orderBy: { dateMouvement: 'desc' } },
        },
    })
