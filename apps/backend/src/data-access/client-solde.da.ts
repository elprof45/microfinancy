import { prisma } from '../../lib/db'

// ─── ClientSolde ───────────────────────────────────────────────────────────
export const findAllClientSoldes = () =>
    prisma.clientSolde.findMany({ include: { client: true, agence: true, utilisateurs: true } })

export const findClientSoldeById = (id: number) =>
    prisma.clientSolde.findUnique({
        where: { id },
        include: { client: true, agence: true, utilisateurs: true },
    })

export const createClientSolde = (data: any) => prisma.clientSolde.create({ data })

export const updateClientSolde = (id: number, data: any) =>
    prisma.clientSolde.update({ where: { id }, data })

export const deleteClientSolde = (id: number) => prisma.clientSolde.delete({ where: { id } })
