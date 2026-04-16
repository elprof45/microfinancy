import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as clientSoldeDA from '../data-access/client-solde.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const soldes = await clientSoldeDA.findAllClientSoldes()
    const hydrated = hydrateMany(soldes, 'clientSolde')
    const formatted = formatResponse(hydrated)
    return c.json(createListResponse(formatted, formatted.length, 0, formatted.length), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json(createErrorResponse('Invalid ID format', 400), 400)
    const solde = await clientSoldeDA.findClientSoldeById(id)
    if (!solde) return c.json(createErrorResponse('Client solde non trouvé', 404), 404)
    const hydrated = hydrateOne(solde, 'clientSolde')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.clientId) return c.json(createErrorResponse('Client est requis', 400), 400)
    const solde = await clientSoldeDA.createClientSolde(data)
    const hydrated = hydrateOne(solde, 'clientSolde')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 201)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json(createErrorResponse('Invalid ID format', 400), 400)
    const existing = await clientSoldeDA.findClientSoldeById(id)
    if (!existing) return c.json(createErrorResponse('Client solde non trouvé', 404), 404)
    const data = await c.req.json()
    const solde = await clientSoldeDA.updateClientSolde(id, data)
    const hydrated = hydrateOne(solde, 'clientSolde')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json(createErrorResponse('Invalid ID format', 400), 400)
    const existing = await clientSoldeDA.findClientSoldeById(id)
    if (!existing) return c.json(createErrorResponse('Client solde non trouvé', 404), 404)
    const solde = await clientSoldeDA.deleteClientSolde(id)
    const hydrated = hydrateOne(solde, 'clientSolde')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

