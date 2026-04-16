import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as compteDA from '../data-access/compte.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const comptes = await compteDA.findAllComptes()
    const hydrated = hydrateMany(comptes, 'compte')
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
    const compte = await compteDA.findCompteById(id)
    if (!compte) return c.json(createErrorResponse('Compte non trouvé', 404), 404)
    const hydrated = hydrateOne(compte, 'compte')
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
    const stats = await compteDA.statsCompte(id)
    if (!stats) return c.json(createErrorResponse('Compte non trouvé', 404), 404)
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
    const history = await compteDA.historyCompte(id)
    if (!history) return c.json(createErrorResponse('Compte non trouvé', 404), 404)
    const formatted = formatResponse(history)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

app.post('/', async (c) => {
  try {
    const data = await c.req.json()
    if (!data.numeroCompte || !data.typeCompte) {
      return c.json(createErrorResponse('Numéro Compte et Type Compte sont requis', 400), 400)
    }
    const compte = await compteDA.createCompte(data)
    const hydrated = hydrateOne(compte, 'compte')
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
    const existing = await compteDA.findCompteById(id)
    if (!existing) return c.json(createErrorResponse('Compte non trouvé', 404), 404)
    const data = await c.req.json()
    const compte = await compteDA.updateCompte(id, data)
    const hydrated = hydrateOne(compte, 'compte')
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
    const existing = await compteDA.findCompteById(id)
    if (!existing) return c.json(createErrorResponse('Compte non trouvé', 404), 404)
    const compte = await compteDA.deleteCompte(id)
    const hydrated = hydrateOne(compte, 'compte')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app

