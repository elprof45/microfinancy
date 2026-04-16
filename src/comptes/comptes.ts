import { Hono } from 'hono'
import * as compteDA from '../data-access/compte.da'

const app = new Hono()

app.get('/', async (c) => {
    const comptes = await compteDA.findAllComptes()
    return c.json(comptes)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const compte = await compteDA.findCompteById(id)
    if (!compte) return c.json({ error: 'Compte not found' }, 404)
    return c.json(compte)
})

app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await compteDA.statsCompte(id)
    if (!stats) return c.json({ error: 'Compte not found' }, 404)
    return c.json(stats)
})

app.get('/:id/history', async (c) => {
    const id = Number(c.req.param('id'))
    const history = await compteDA.historyCompte(id)
    if (!history) return c.json({ error: 'Compte not found' }, 404)
    return c.json(history)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const compte = await compteDA.createCompte(data)
    return c.json(compte, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const compte = await compteDA.updateCompte(id, data)
    return c.json(compte)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const compte = await compteDA.deleteCompte(id)
    return c.json(compte)
})

export default app
