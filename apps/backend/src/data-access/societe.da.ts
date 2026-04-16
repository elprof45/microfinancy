import { prisma } from '../../lib/db'

// ─── Societe ────────────────────────────────────────────────────────────────
export const findAllSocietes = () =>
    prisma.societe.findMany({ include: { agences: true, utilisateurs: true } })

export const findSocieteById = (id: number) =>
    prisma.societe.findUnique({
        where: { id },
        include: {
            agences: { include: { clients: true, utilisateurs: true } },
            utilisateurs: true,
        },
    })

export const createSociete = (data: any) => prisma.societe.create({ data })

export const updateSociete = (id: number, data: any) =>
    prisma.societe.update({ where: { id }, data })

export const deleteSociete = (id: number) =>
    prisma.societe.delete({ where: { id } })

// ─── Stats ──────────────────────────────────────────────────────────────────
export const statsSociete = async (id: number) => {
    const societe = await prisma.societe.findUnique({
        where: { id },
        include: {
            agences: {
                include: {
                    clients: { include: { clientSoldes: true } },
                    utilisateurs: true,
                    cotisations: true,
                },
            },
            utilisateurs: true,
        },
    })
    if (!societe) return null
    return {
        id: societe.id,
        nom: societe.nom,
        totalAgences: societe.agences.length,
        totalUtilisateurs: societe.utilisateurs.length,
        totalClients: societe.agences.reduce((acc, a) => acc + a.clients.length, 0),
        totalCotisations: societe.agences.reduce((acc, a) => acc + a.cotisations.length, 0),
    }
}
