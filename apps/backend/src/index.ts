import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
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
import authRouter from './auth/auth_router'
import workflowRouter from './workflows/workflows_router'
import bulkRouter from './bulk/bulk_router'
import reportsRouter from './reports/reports_router'
import { logger } from 'hono/logger'
import { createErrorResponse } from './types/api'
import { authMiddleware } from './middleware/auth'
import { formatErrorResponse } from './lib/errors'

const app = new Hono()

app.use(logger())

// CORS middleware
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (c.req.method === 'OPTIONS') {
    return c.text('ok')
  }
  return next()
})

// API routes
// Health check endpoint (public)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// Auth routes (public)
app.route('/auth', authRouter)

// Protected routes (require authentication)
app.use('/users', authMiddleware)
app.use('/societies', authMiddleware)
app.use('/agences', authMiddleware)
app.use('/client-totines', authMiddleware)
app.use('/carnets', authMiddleware)
app.use('/cotisations', authMiddleware)
app.use('/mouvement-totines', authMiddleware)
app.use('/client-soldes', authMiddleware)
app.use('/comptes', authMiddleware)
app.use('/mouvement-epargnes', authMiddleware)
app.use('/mouvement-items', authMiddleware)
app.use('/workflows', authMiddleware)
app.use('/bulk', authMiddleware)
app.use('/reports', authMiddleware)

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
app.route('/workflows', workflowRouter)
app.route('/bulk', bulkRouter)
app.route('/reports', reportsRouter)

// Error handling middleware
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const statusCode = err.status
    const message = err.message || 'HTTP Exception'
    return c.json(createErrorResponse(message, statusCode), statusCode)
  }

  // Prisma validation errors
  if ((err as any)?.code?.startsWith('P')) {
    const message = (err as any).message || 'Database error'
    return c.json(
      createErrorResponse(message, 400),
      400
    )
  }

  // Fallback error
  const isDev = process.env.NODE_ENV === 'development'
  const errorResponse = formatErrorResponse(err)
  const statusCode = errorResponse.statusCode
  const message = isDev ? errorResponse.error : 'Internal server error'
  
  console.error('[Error]', {
    timestamp: new Date().toISOString(),
    statusCode,
    message,
    error: isDev ? err : undefined,
  })
  
  return c.json(
    { ...createErrorResponse(message, statusCode) }
  )
})

// 404 handler
app.notFound((c) => {
  return c.json(
    createErrorResponse('Not found', 404),
    404
  )
})

export default { 
  port: 3030, 
  fetch: app.fetch, 
} 
