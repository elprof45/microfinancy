import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as cotisationDA from '../data-access/cotisation.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const cotisations = await cotisationDA.findAllCotisations()
    const hydrated = hydrateMany(cotisations, 'cotisation')
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
    const cotisation = await cotisationDA.findCotisationById(id)
    if (!cotisation) return c.json(createErrorResponse('Cotisation non trouvée', 404), 404)
    const hydrated = hydrateOne(cotisation, 'cotisation')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.mois || !data.annee || !data.mise || !data.clientId) {
      return c.json(createErrorResponse('Mois, Année, Mise, et Client sont requis', 400), 400)
    }
    const cotisation = await cotisationDA.createCotisation(data)
    const hydrated = hydrateOne(cotisation, 'cotisation')
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
    const existing = await cotisationDA.findCotisationById(id)
    if (!existing) return c.json(createErrorResponse('Cotisation non trouvée', 404), 404)
    const data = await c.req.json()
    const cotisation = await cotisationDA.updateCotisation(id, data)
    const hydrated = hydrateOne(cotisation, 'cotisation')
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
    const existing = await cotisationDA.findCotisationById(id)
    if (!existing) return c.json(createErrorResponse('Cotisation non trouvée', 404), 404)
    const cotisation = await cotisationDA.deleteCotisation(id)
    const hydrated = hydrateOne(cotisation, 'cotisation')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

