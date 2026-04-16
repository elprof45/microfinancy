import { prisma } from '../../lib/db'

// ─── Utilisateur ─────────────────────────────────────────────────────────────
export const findAllUtilisateurs = () =>
    prisma.utilisateur.findMany({ include: { societe: true, agence: true } })

export const findUtilisateurById = (id: number) =>
    prisma.utilisateur.findUnique({
        where: { id },
        include: {
            societe: true,
            agence: true,
            clientTotines: { include: { clientSoldes: true } },
            cotisations: true,
            carnets: true,
        },
    })

export const createUtilisateur = (data: any) =>
    prisma.utilisateur.create({ data })

export const updateUtilisateur = (id: number, data: any) =>
    prisma.utilisateur.update({ where: { id }, data })

export const deleteUtilisateur = (id: number) =>
    prisma.utilisateur.delete({ where: { id } })

// ─── Stats ───────────────────────────────────────────────────────────────────
export const statsUtilisateur = async (id: number) => {
    const user = await prisma.utilisateur.findUnique({
        where: { id },
        include: {
            clientTotines: { include: { cotisations: true, clientSoldes: true } },
            carnets: true,
            cotisations: true,
            mouvementTotines: true,
        },
    })
    if (!user) return null
    return {
        id: user.id,
        nom: user.nom,
        role: user.role,
        totalClients: user.clientTotines.length,
        totalCarnets: user.carnets.length,
        totalCotisations: user.cotisations.length,
        totalMouvements: user.mouvementTotines.length,
    }
}
