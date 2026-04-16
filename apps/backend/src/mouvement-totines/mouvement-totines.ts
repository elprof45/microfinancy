import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as mouvementDA from '../data-access/mouvement-totine.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const mouvements = await mouvementDA.findAllMouvementTotines()
    const hydrated = hydrateMany(mouvements, 'mouvementTotine')
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
    const mouvement = await mouvementDA.findMouvementTotineById(id)
    if (!mouvement) return c.json(createErrorResponse('Mouvement totine non trouvé', 404), 404)
    const hydrated = hydrateOne(mouvement, 'mouvementTotine')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.agenceId) return c.json(createErrorResponse('Agence est requise', 400), 400)
    const mouvement = await mouvementDA.createMouvementTotine(data)
    const hydrated = hydrateOne(mouvement, 'mouvementTotine')
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
    const existing = await mouvementDA.findMouvementTotineById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement totine non trouvé', 404), 404)
    const data = await c.req.json()
    const mouvement = await mouvementDA.updateMouvementTotine(id, data)
    const hydrated = hydrateOne(mouvement, 'mouvementTotine')
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
    const existing = await mouvementDA.findMouvementTotineById(id)
    if (!existing) return c.json(createErrorResponse('Mouvement totine non trouvé', 404), 404)
    const mouvement = await mouvementDA.deleteMouvementTotine(id)
    const hydrated = hydrateOne(mouvement, 'mouvementTotine')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

