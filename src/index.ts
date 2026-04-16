import { Hono } from 'hono'
import users from './users/users_router'
import societies from './society/society_router'
import agences from './agences/agences'
import clientTotines from './client-totines/client-totines'
import carnets from './carnets/carnets'
import cotisations from './cotisations/cotisations'
import mouvementTotines from './mouvement-totines/mouvement-totines'
import clientSoldes from './client-soldes/client-soldes'
import comptes from './comptes/comptes'
import mouvementEpargnes from './mouvement-epargnes/mouvement-epargnes'
import mouvementItems from './mouvement-items/mouvement-items'
import { logger } from 'hono/logger'
import { readFile } from 'fs/promises'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'

const app = new Hono()
app.use(logger())

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (c.req.method === 'OPTIONS') {
    return c.text('ok')
  }
  return next()
})

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
}

const frontendDir = fileURLToPath(new URL('../frontend/', import.meta.url))

app.get('/', (c) => c.redirect('/app'))
app.get('/app', (c) => c.redirect('/app/index.html'))
app.get('/app/:file', async (c) => {
  const file = c.req.param('file')
  const filePath = join(frontendDir, file)
  if (!filePath.startsWith(frontendDir)) {
    return c.text('Not Found', 404)
  }
  const body = await readFile(filePath)
  const contentType = mimeTypes[extname(file)] || 'application/octet-stream'
  return c.body(body, 200, { 'Content-Type': contentType })
})

app.route('/users', users)
app.route('/societies', societies)
app.route('/agences', agences)
app.route('/client-totines', clientTotines)
app.route('/carnets', carnets)
app.route('/cotisations', cotisations)
app.route('/mouvement-totines', mouvementTotines)
app.route('/client-soldes', clientSoldes)
app.route('/comptes', comptes)
app.route('/mouvement-epargnes', mouvementEpargnes)
app.route('/mouvement-items', mouvementItems)

export default app
