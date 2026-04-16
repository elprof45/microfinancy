import { prisma } from '../../lib/db'

// ─── Agence ─────────────────────────────────────────────────────────────────
export const findAllAgences = () =>
    prisma.agence.findMany({ include: { societe: true, utilisateurs: true } })

export const findAgenceById = (id: number) =>
    prisma.agence.findUnique({
        where: { id },
        include: {
            societe: true,
            utilisateurs: true,
            clients: { include: { clientSoldes: true, carnets: true } },
            cotisations: true,
        },
    })

export const createAgence = (data: any) => prisma.agence.create({ data })

export const updateAgence = (id: number, data: any) =>
    prisma.agence.update({ where: { id }, data })

export const deleteAgence = (id: number) =>
    prisma.agence.delete({ where: { id } })

// ─── Stats ──────────────────────────────────────────────────────────────────
export const statsAgence = async (id: number) => {
    const agence = await prisma.agence.findUnique({
        where: { id },
        include: {
            clients: { include: { clientSoldes: true, cotisations: true } },
            utilisateurs: true,
            cotisations: true,
            mouvementTotines: true,
        },
    })
    if (!agence) return null
    const totalSolde = agence.clients.reduce(
        (acc, c) => acc + c.clientSoldes.reduce((s, cs) => s + Number(cs.soldeTotal), 0),
        0,
    )
    return {
        id: agence.id,
        nom: agence.nom,
        totalClients: agence.clients.length,
        totalUtilisateurs: agence.utilisateurs.length,
        totalCotisations: agence.cotisations.length,
        totalMouvements: agence.mouvementTotines.length,
        totalSoldeClients: totalSolde,
    }
}
