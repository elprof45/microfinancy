import { Hono } from 'hono'
import * as carnetDA from '../data-access/carnet.da'

const app = new Hono()

app.get('/', async (c) => {
    const carnets = await carnetDA.findAllCarnets()
    return c.json(carnets)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const carnet = await carnetDA.findCarnetById(id)
    if (!carnet) return c.json({ error: 'Carnet not found' }, 404)
    return c.json(carnet)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const carnet = await carnetDA.createCarnet(data)
    return c.json(carnet, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const carnet = await carnetDA.updateCarnet(id, data)
    return c.json(carnet)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const carnet = await carnetDA.deleteCarnet(id)
    return c.json(carnet)
})

export default app
