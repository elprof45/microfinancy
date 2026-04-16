import { Hono } from 'hono'
import * as cotisationDA from '../data-access/cotisation.da'

const app = new Hono()

app.get('/', async (c) => {
    const cotisations = await cotisationDA.findAllCotisations()
    return c.json(cotisations)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const cotisation = await cotisationDA.findCotisationById(id)
    if (!cotisation) return c.json({ error: 'Cotisation not found' }, 404)
    return c.json(cotisation)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const cotisation = await cotisationDA.createCotisation(data)
    return c.json(cotisation, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const cotisation = await cotisationDA.updateCotisation(id, data)
    return c.json(cotisation)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const cotisation = await cotisationDA.deleteCotisation(id)
    return c.json(cotisation)
})

export default app
