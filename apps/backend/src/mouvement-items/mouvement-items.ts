import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as mouvementItemDA from '../data-access/mouvement-item.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const mouvements = await mouvementItemDA.findAllMouvementItems()
    const hydrated = hydrateMany(mouvements, 'mouvementItem')
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
    const mouvement = await mouvementItemDA.findMouvementItemById(id)
    if (!mouvement) return c.json(createErrorResponse('Mouvement item non trouvé', 404), 404)
    const hydrated = hydrateOne(mouvement, 'mouvementItem')
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
    const stats = await mouvementItemDA.statsMouvementItem(id)
    if (!stats) return c.json(createErrorResponse('Mouvement item non trouvé', 404), 404)
    const formatted = formatResponse(stats)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.get('/:id/history', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json(createErrorResponse('Invalid ID format', 400), 400)
    const history = await mouvementItemDA.historyMouvementItem(id)
    if (!history) return c.json(createErrorResponse('Mouvement item non trouvé', 404), 404)
    const formatted = formatResponse(history)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.carnetId) return c.json(createErrorResponse('Carnet est requis', 400), 400)
    const mouvement = await mouvementItemDA.createMouvementItem(data)
    const hydrated = hydrateOne(mouvement, 'mouvementItem')
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
    const existing = await mouvementItemDA.findMouvementItemById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement item non trouvé', 404), 404)
    const data = await c.req.json()
    const mouvement = await mouvementItemDA.updateMouvementItem(id, data)
    const hydrated = hydrateOne(mouvement, 'mouvementItem')
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
    const existing = await mouvementItemDA.findMouvementItemById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement item non trouvé', 404), 404)
    const mouvement = await mouvementItemDA.deleteMouvementItem(id)
    const hydrated = hydrateOne(mouvement, 'mouvementItem')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

