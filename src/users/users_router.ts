import { Hono } from 'hono'
import * as utilisateurDA from '../data-access/utilisateur.da'

const app = new Hono()

// GET all users
app.get('/', async (c) => {
    const users = await utilisateurDA.findAllUtilisateurs()
    return c.json(users)
})

// GET unique user with details
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const user = await utilisateurDA.findUtilisateurById(id)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json(user)
})

// GET user stats
app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await utilisateurDA.statsUtilisateur(id)
    if (!stats) return c.json({ error: 'User not found' }, 404)
    return c.json(stats)
})

// CREATE user
app.post('/', async (c) => {
    const data = await c.req.json()
    const user = await utilisateurDA.createUtilisateur(data)
    return c.json(user, 201)
})

// UPDATE user
app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const user = await utilisateurDA.updateUtilisateur(id, data)
    return c.json(user)
})

// DELETE user
app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const user = await utilisateurDA.deleteUtilisateur(id)
    return c.json(user)
})

export default app
