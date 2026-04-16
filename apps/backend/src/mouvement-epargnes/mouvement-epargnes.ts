import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as mouvementEpargneDA from '../data-access/mouvement-epargne.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const mouvements = await mouvementEpargneDA.findAllMouvementEpargnes()
    const hydrated = hydrateMany(mouvements, 'mouvementEpargne')
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
    const mouvement = await mouvementEpargneDA.findMouvementEpargneById(id)
    if (!mouvement) return c.json(createErrorResponse('Mouvement épargne non trouvé', 404), 404)
    const hydrated = hydrateOne(mouvement, 'mouvementEpargne')
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
    const stats = await mouvementEpargneDA.statsMouvementEpargne(id)
    if (!stats) return c.json(createErrorResponse('Mouvement épargne non trouvé', 404), 404)
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
    const history = await mouvementEpargneDA.historyMouvementEpargne(id)
    if (!history) return c.json(createErrorResponse('Mouvement épargne non trouvé', 404), 404)
    const formatted = formatResponse(history)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.compteId) return c.json(createErrorResponse('Compte est requis', 400), 400)
    const mouvement = await mouvementEpargneDA.createMouvementEpargne(data)
    const hydrated = hydrateOne(mouvement, 'mouvementEpargne')
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
    const existing = await mouvementEpargneDA.findMouvementEpargneById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement épargne non trouvé', 404), 404)
    const data = await c.req.json()
    const mouvement = await mouvementEpargneDA.updateMouvementEpargne(id, data)
    const hydrated = hydrateOne(mouvement, 'mouvementEpargne')
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
    const existing = await mouvementEpargneDA.findMouvementEpargneById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement épargne non trouvé', 404), 404)
    const mouvement = await mouvementEpargneDA.deleteMouvementEpargne(id)
    const hydrated = hydrateOne(mouvement, 'mouvementEpargne')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

