import { prisma } from '../../lib/db'

// ─── Cotisation ───────────────────────────────────────────────────────────────
export const findAllCotisations = () =>
    prisma.cotisation.findMany({
        include: { client: true, carnet: true, agence: true, utilisateurs: true },
    })

export const findCotisationById = (id: number) =>
    prisma.cotisation.findUnique({
        where: { id },
        include: {
            client: true,
            carnet: { include: { mouvementTotines: true } },
            agence: true,
            utilisateurs: true,
            mouvements: true,
        },
    })

export const createCotisation = (data: any) =>
    prisma.cotisation.create({ data })

export const updateCotisation = (id: number, data: any) =>
    prisma.cotisation.update({ where: { id }, data })

export const deleteCotisation = (id: number) =>
    prisma.cotisation.delete({ where: { id } })
