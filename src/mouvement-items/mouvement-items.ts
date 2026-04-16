import { Hono } from 'hono'
import * as mouvementItemDA from '../data-access/mouvement-item.da'

const app = new Hono()

app.get('/', async (c) => {
    const mouvements = await mouvementItemDA.findAllMouvementItems()
    return c.json(mouvements)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementItemDA.findMouvementItemById(id)
    if (!mouvement) return c.json({ error: 'Mouvement item not found' }, 404)
    return c.json(mouvement)
})

app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await mouvementItemDA.statsMouvementItem(id)
    if (!stats) return c.json({ error: 'Mouvement item not found' }, 404)
    return c.json(stats)
})

app.get('/:id/history', async (c) => {
    const id = Number(c.req.param('id'))
    const history = await mouvementItemDA.historyMouvementItem(id)
    if (!history) return c.json({ error: 'Mouvement item not found' }, 404)
    return c.json(history)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const mouvement = await mouvementItemDA.createMouvementItem(data)
    return c.json(mouvement, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const mouvement = await mouvementItemDA.updateMouvementItem(id, data)
    return c.json(mouvement)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementItemDA.deleteMouvementItem(id)
    return c.json(mouvement)
})

export default app
