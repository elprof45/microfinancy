import { Hono } from 'hono'
import * as societeDA from '../data-access/societe.da'

const app = new Hono()

// GET all societies
app.get('/', async (c) => {
    const societies = await societeDA.findAllSocietes()
    return c.json(societies)
})

// GET unique society with details
app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const society = await societeDA.findSocieteById(id)
    if (!society) return c.json({ error: 'Society not found' }, 404)
    return c.json(society)
})

// GET society stats
app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await societeDA.statsSociete(id)
    if (!stats) return c.json({ error: 'Society not found' }, 404)
    return c.json(stats)
})

// CREATE society
app.post('/', async (c) => {
    const data = await c.req.json()
    const society = await societeDA.createSociete(data)
    return c.json(society, 201)
})

// UPDATE society
app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const society = await societeDA.updateSociete(id, data)
    return c.json(society)
})

// DELETE society
app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const society = await societeDA.deleteSociete(id)
    return c.json(society)
})

export default app