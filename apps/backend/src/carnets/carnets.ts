import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as carnetDA from '../data-access/carnet.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const carnets = await carnetDA.findAllCarnets()
    const hydrated = hydrateMany(carnets, 'carnet')
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
    const carnet = await carnetDA.findCarnetById(id)
    if (!carnet) return c.json(createErrorResponse('Carnet non trouvé', 404), 404)
    const hydrated = hydrateOne(carnet, 'carnet')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.numeroCarnet || !data.clientId) {
      return c.json(createErrorResponse('Numéro Carnet et Client sont requis', 400), 400)
    }
    const carnet = await carnetDA.createCarnet(data)
    const hydrated = hydrateOne(carnet, 'carnet')
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
    const existing = await carnetDA.findCarnetById(id)
    if (!existing) return c.json(createErrorResponse('Carnet non trouvé', 404), 404)
    const data = await c.req.json()
    const carnet = await carnetDA.updateCarnet(id, data)
    const hydrated = hydrateOne(carnet, 'carnet')
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
    const existing = await carnetDA.findCarnetById(id)
    if (!existing) return c.json(createErrorResponse('Carnet non trouvé', 404), 404)
    const carnet = await carnetDA.deleteCarnet(id)
    const hydrated = hydrateOne(carnet, 'carnet')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

