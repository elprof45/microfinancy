import { Hono } from 'hono'
import * as mouvementEpargneDA from '../data-access/mouvement-epargne.da'

const app = new Hono()

app.get('/', async (c) => {
    const mouvements = await mouvementEpargneDA.findAllMouvementEpargnes()
    return c.json(mouvements)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementEpargneDA.findMouvementEpargneById(id)
    if (!mouvement) return c.json({ error: 'Mouvement epargne not found' }, 404)
    return c.json(mouvement)
})

app.get('/:id/stats', async (c) => {
    const id = Number(c.req.param('id'))
    const stats = await mouvementEpargneDA.statsMouvementEpargne(id)
    if (!stats) return c.json({ error: 'Mouvement epargne not found' }, 404)
    return c.json(stats)
})

app.get('/:id/history', async (c) => {
    const id = Number(c.req.param('id'))
    const history = await mouvementEpargneDA.historyMouvementEpargne(id)
    if (!history) return c.json({ error: 'Mouvement epargne not found' }, 404)
    return c.json(history)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const mouvement = await mouvementEpargneDA.createMouvementEpargne(data)
    return c.json(mouvement, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const mouvement = await mouvementEpargneDA.updateMouvementEpargne(id, data)
    return c.json(mouvement)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementEpargneDA.deleteMouvementEpargne(id)
    return c.json(mouvement)
})

export default app
