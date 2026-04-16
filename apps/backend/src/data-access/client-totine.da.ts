import { prisma } from '../../lib/db'

// ─── ClientTotine ─────────────────────────────────────────────────────────────
export const findAllClients = () =>
    prisma.clientTotine.findMany({
        include: { agence: true, utilisateurs: true, clientSoldes: true },
    })

export const findClientById = (id: number) =>
    prisma.clientTotine.findUnique({
        where: { id },
        include: {
            agence: true,
            utilisateurs: true,
            carnets: { include: { cotisations: true, mouvementTotines: true } },
            cotisations: true,
            clientSoldes: true,
        },
    })

export const createClient = (data: any) =>
    prisma.clientTotine.create({ data })

export const updateClient = (id: number, data: any) =>
    prisma.clientTotine.update({ where: { id }, data })

export const deleteClient = (id: number) =>
    prisma.clientTotine.delete({ where: { id } })
