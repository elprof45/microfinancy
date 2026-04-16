import { prisma } from '../../lib/db'

// ─── Carnet ───────────────────────────────────────────────────────────────────
export const findAllCarnets = () =>
    prisma.carnet.findMany({
        include: { client: true, utilisateurs: true, cotisations: true },
    })

export const findCarnetById = (id: number) =>
    prisma.carnet.findUnique({
        where: { id },
        include: {
            client: true,
            utilisateurs: true,
            cotisations: { include: { agence: true } },
            mouvementTotines: true,
        },
    })

export const createCarnet = (data: any) => prisma.carnet.create({ data })

export const updateCarnet = (id: number, data: any) =>
    prisma.carnet.update({ where: { id }, data })

export const deleteCarnet = (id: number) =>
    prisma.carnet.delete({ where: { id } })
