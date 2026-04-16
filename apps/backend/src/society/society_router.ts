import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as societeDA from '../data-access/societe.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

// GET all societies
app.get('/', async (c) => {
  try {
    const societies = await societeDA.findAllSocietes()
    const hydrated = hydrateMany(societies, 'societe')
    const formatted = formatResponse(hydrated)
    return c.json(
      createListResponse(formatted, formatted.length, 0, formatted.length),
      200
    )
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// GET unique society with details
app.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const society = await societeDA.findSocieteById(id)
    if (!society) {
      return c.json(createErrorResponse('Société non trouvée', 404), 404)
    }

    const hydrated = hydrateOne(society, 'societe')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// GET society stats
app.get('/:id/stats', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const stats = await societeDA.statsSociete(id)
    if (!stats) {
      return c.json(createErrorResponse('Société non trouvée', 404), 404)
    }

    const formatted = formatResponse(stats)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// CREATE society
app.post('/', async (c) => {
  try {
    const data = await c.req.json()

    // Basic validation
    if (!data.nom || typeof data.nom !== 'string' || data.nom.trim().length === 0) {
      return c.json(
        createErrorResponse('Nom est requis', 400, [
          { field: 'nom', message: 'Nom est requis' },
        ]),
        400
      )
    }

    if (!data.raisonSociale || typeof data.raisonSociale !== 'string') {
      return c.json(
        createErrorResponse('Raison Sociale est requise', 400, [
          { field: 'raisonSociale', message: 'Raison Sociale est requise' },
        ]),
        400
      )
    }

    const society = await societeDA.createSociete(data)
    const hydrated = hydrateOne(society, 'societe')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 201)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// UPDATE society
app.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const data = await c.req.json()

    // Verify society exists
    const existing = await societeDA.findSocieteById(id)
    if (!existing) {
      return c.json(createErrorResponse('Société non trouvée', 404), 404)
    }

    const society = await societeDA.updateSociete(id, data)
    const hydrated = hydrateOne(society, 'societe')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// DELETE society
app.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    // Verify society exists
    const existing = await societeDA.findSocieteById(id)
    if (!existing) {
      return c.json(createErrorResponse('Société non trouvée', 404), 404)
    }

    const society = await societeDA.deleteSociete(id)
    const hydrated = hydrateOne(society, 'societe')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app
