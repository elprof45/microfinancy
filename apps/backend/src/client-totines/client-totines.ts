import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as clientDA from '../data-access/client-totine.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const clients = await clientDA.findAllClients()
    const hydrated = hydrateMany(clients, 'client')
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
    const client = await clientDA.findClientById(id)
    if (!client) return c.json(createErrorResponse('Client non trouvé', 404), 404)
    const hydrated = hydrateOne(client, 'client')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.numeroClient || !data.nom || !data.agenceId) {
      return c.json(createErrorResponse('Numéro Client, Nom, et Agence sont requis', 400), 400)
    }
    const client = await clientDA.createClient(data)
    const hydrated = hydrateOne(client, 'client')
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
    const existing = await clientDA.findClientById(id)
    if (!existing) return c.json(createErrorResponse('Client non trouvé', 404), 404)
    const data = await c.req.json()
    const client = await clientDA.updateClient(id, data)
    const hydrated = hydrateOne(client, 'client')
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
    const existing = await clientDA.findClientById(id)
    if (!existing) return c.json(createErrorResponse('Client non trouvé', 404), 404)
    const client = await clientDA.deleteClient(id)
    const hydrated = hydrateOne(client, 'client')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

