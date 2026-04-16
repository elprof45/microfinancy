import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as utilisateurDA from '../data-access/utilisateur.da'
import { createResponse, createListResponse, createErrorResponse } from '../types/api'
import { hydrateMany, hydrateOne, formatResponse } from '../data-access/utils'

const app = new Hono()

// GET all users
app.get('/', async (c) => {
  try {
    const users = await utilisateurDA.findAllUtilisateurs()
    const hydrated = hydrateMany(users, 'utilisateur')
    const formatted = formatResponse(hydrated)
    return c.json(
      createListResponse(formatted, formatted.length, 0, formatted.length),
      200
    )
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// GET unique user with details
app.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const user = await utilisateurDA.findUtilisateurById(id)
    if (!user) {
      return c.json(createErrorResponse('Utilisateur non trouvé', 404), 404)
    }

    const hydrated = hydrateOne(user, 'utilisateur')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// GET user stats
app.get('/:id/stats', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const stats = await utilisateurDA.statsUtilisateur(id)
    if (!stats) {
      return c.json(createErrorResponse('Utilisateur non trouvé', 404), 404)
    }

    const formatted = formatResponse(stats)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// CREATE user
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

    if (!data.email || typeof data.email !== 'string') {
      return c.json(
        createErrorResponse('Email est requis', 400, [
          { field: 'email', message: 'Email est requis' },
        ]),
        400
      )
    }

    if (!data.role || typeof data.role !== 'string') {
      return c.json(
        createErrorResponse('Role est requis', 400, [
          { field: 'role', message: 'Role est requis' },
        ]),
        400
      )
    }

    if (!data.societeId || typeof data.societeId !== 'number') {
      return c.json(
        createErrorResponse('Société est requise', 400, [
          { field: 'societeId', message: 'Société est requise' },
        ]),
        400
      )
    }

    const user = await utilisateurDA.createUtilisateur(data)
    const hydrated = hydrateOne(user, 'utilisateur')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 201)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// UPDATE user
app.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    const data = await c.req.json()

    // Verify user exists
    const existing = await utilisateurDA.findUtilisateurById(id)
    if (!existing) {
      return c.json(createErrorResponse('Utilisateur non trouvé', 404), 404)
    }

    const user = await utilisateurDA.updateUtilisateur(id, data)
    const hydrated = hydrateOne(user, 'utilisateur')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

// DELETE user
app.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json(createErrorResponse('Invalid ID format', 400), 400)
    }

    // Verify user exists
    const existing = await utilisateurDA.findUtilisateurById(id)
    if (!existing) {
      return c.json(createErrorResponse('Utilisateur non trouvé', 404), 404)
    }

    const user = await utilisateurDA.deleteUtilisateur(id)
    const hydrated = hydrateOne(user, 'utilisateur')
    const formatted = formatResponse(hydrated)
    return c.json(createResponse(formatted), 200)
  } catch (err: any) {
    throw new HTTPException(500, { cause: err })
  }
})

export default app
