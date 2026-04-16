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

const app = new Hono()

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
