import { prisma } from '../../lib/db'

// ─── MouvementTotine ──────────────────────────────────────────────────────────
export const findAllMouvementTotines = () =>
    prisma.mouvementTotine.findMany({
        include: { carnet: true, agence: true, utilisateur: true, clientTotine: true },
    })

export const findMouvementTotineById = (id: number) =>
    prisma.mouvementTotine.findUnique({
        where: { id },
        include: {
            carnet: { include: { client: true } },
            agence: true,
            utilisateur: true,
            clientTotine: true,
        },
    })

export const createMouvementTotine = (data: any) =>
    prisma.mouvementTotine.create({ data })

export const updateMouvementTotine = (id: number, data: any) =>
    prisma.mouvementTotine.update({ where: { id }, data })

export const deleteMouvementTotine = (id: number) =>
    prisma.mouvementTotine.delete({ where: { id } })
