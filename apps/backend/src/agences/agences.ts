import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as agenceDA from '../data-access/agence.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const agences = await agenceDA.findAllAgences()
    const hydrated = hydrateMany(agences, 'agence')
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
    const agence = await agenceDA.findAgenceById(id)
    if (!agence) return c.json(createErrorResponse('Agence non trouvée', 404), 404)
    const hydrated = hydrateOne(agence, 'agence')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.get('/:id/stats', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json(createErrorResponse('Invalid ID format', 400), 400)
    const stats = await agenceDA.statsAgence(id)
    if (!stats) return c.json(createErrorResponse('Agence non trouvée', 404), 404)
    const formatted = formatResponse(stats)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.code || !data.nom || !data.societeId) {
      return c.json(createErrorResponse('Code, Nom, et Société sont requis', 400), 400)
    }
    const agence = await agenceDA.createAgence(data)
    const hydrated = hydrateOne(agence, 'agence')
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
    const existing = await agenceDA.findAgenceById(id)
    if (!existing) return c.json(createErrorResponse('Agence non trouvée', 404), 404)
    const data = await c.req.json()
    const agence = await agenceDA.updateAgence(id, data)
    const hydrated = hydrateOne(agence, 'agence')
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
    const existing = await agenceDA.findAgenceById(id)
    if (!existing) return c.json(createErrorResponse('Agence non trouvée', 404), 404)
    const agence = await agenceDA.deleteAgence(id)
    const hydrated = hydrateOne(agence, 'agence')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app
