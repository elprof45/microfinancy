import { Hono } from 'hono'
import * as clientSoldeDA from '../data-access/client-solde.da'

const app = new Hono()

app.get('/', async (c) => {
    const soldes = await clientSoldeDA.findAllClientSoldes()
    return c.json(soldes)
})

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const solde = await clientSoldeDA.findClientSoldeById(id)
    if (!solde) return c.json({ error: 'Client solde not found' }, 404)
    return c.json(solde)
})

app.post('/', async (c) => {
    const data = await c.req.json()
    const solde = await clientSoldeDA.createClientSolde(data)
    return c.json(solde, 201)
})

app.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const data = await c.req.json()
    const solde = await clientSoldeDA.updateClientSolde(id, data)
    return c.json(solde)
})

app.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const solde = await clientSoldeDA.deleteClientSolde(id)
    return c.json(solde)
})

export default app
