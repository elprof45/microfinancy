import { Hono } from 'hono'
import * as mouvementDA from '../data-access/mouvement-totine.da'

const app = new Hono()

app.get('/', async (c) => {
    const mouvements = await mouvementDA.findAllMouvementTotines()
    return c.json(mouvements)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementDA.findMouvementTotineById(id)
    if (!mouvement) return c.json({ error: 'Mouvement totine not found' }, 404)
    return c.json(mouvement)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const mouvement = await mouvementDA.createMouvementTotine(data)
    return c.json(mouvement, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const mouvement = await mouvementDA.updateMouvementTotine(id, data)
    return c.json(mouvement)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const mouvement = await mouvementDA.deleteMouvementTotine(id)
    return c.json(mouvement)
})

export default app
