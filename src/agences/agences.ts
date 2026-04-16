import { Hono } from 'hono'
import * as agenceDA from '../data-access/agence.da'

const app = new Hono()

app.get('/', async (c) => {
    const agences = await agenceDA.findAllAgences()
    return c.json(agences)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const agence = await agenceDA.findAgenceById(id)
    if (!agence) return c.json({ error: 'Agence not found' }, 404)
    return c.json(agence)
})

app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await agenceDA.statsAgence(id)
    if (!stats) return c.json({ error: 'Agence not found' }, 404)
    return c.json(stats)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const agence = await agenceDA.createAgence(data)
    return c.json(agence, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const agence = await agenceDA.updateAgence(id, data)
    return c.json(agence)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const agence = await agenceDA.deleteAgence(id)
    return c.json(agence)
})

export default app