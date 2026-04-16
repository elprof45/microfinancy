import { Hono } from 'hono'
import * as clientDA from '../data-access/client-totine.da'

const app = new Hono()

app.get('/', async (c) => {
    const clients = await clientDA.findAllClients()
    return c.json(clients)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const client = await clientDA.findClientById(id)
    if (!client) return c.json({ error: 'Client not found' }, 404)
    return c.json(client)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const client = await clientDA.createClient(data)
    return c.json(client, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const client = await clientDA.updateClient(id, data)
    return c.json(client)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const client = await clientDA.deleteClient(id)
    return c.json(client)
})

export default app
