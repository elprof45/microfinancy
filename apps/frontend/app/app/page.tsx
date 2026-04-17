'use client'

import Link from "next/link"
import { useProtectedRoute } from "@/lib/use-protected-route"
import ApiHealthTracker from '@/components/ApiHealthTracker'

const sections = [
  { path: '/app/societes', title: 'Sociétés', description: 'Gérer les sociétés et leurs données générales.' },
  { path: '/app/agences', title: 'Agences', description: 'Gérer les agences et leur rattachement.' },
  { path: '/app/users', title: 'Utilisateurs', description: 'Gérer les utilisateurs, rôles et accès.' },
  { path: '/app/client-totines', title: 'Clients Totine', description: 'Gestion des clients Totine et de leurs fiches.' },
  { path: '/app/carnets', title: 'Carnets', description: 'Suivre les carnets de collecte et leurs clients.' },
  { path: '/app/cotisations', title: 'Cotisations', description: 'Créer et suivre les cotisations client.' },
  { path: '/app/comptes', title: 'Comptes', description: 'Consulter et modifier les comptes clients.' },
  { path: '/app/mouvement-epargnes', title: 'Mouvements épargne', description: 'Gérer les mouvements d'épargne et les références.' },
  { path: '/app/mouvement-items', title: 'Mouvements items', description: 'Suivre les dépôts et retraits sur les comptes.' },
  { path: '/app/client-soldes', title: 'Soldes clients', description: 'Consulter et ajuster les soldes totaux des clients.' },
  { path: '/app/mouvement-totines', title: 'Mouvements totines', description: 'Enregistrer les mouvements Totine et leurs montants.' },
]

export default function Home() {
  const { isLoading } = useProtectedRoute()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200 mb-4"></div>
          <div className="h-4 w-full animate-pulse rounded bg-slate-200 mb-2"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tableau de bord</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Administration Microfinancy</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Interface centralisée pour toutes les entités métier : sociétés, agences, utilisateurs, comptes, cotisations et mouvements. Chaque carte donne accès à un écran dédié pour gérer les données via l'API backend.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.path} href={section.path} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-slate-800">{section.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <ApiHealthTracker compact />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Connexion API</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Le frontend se connecte au backend via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_API_BASE</code> ou <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">http://localhost:3030</code>.</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Routes disponibles</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Chaque ressource est accessible par une page dynamique : <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/app/societes</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/app/agences</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/app/users</code>, etc.</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Utilisez la barre de navigation en haut pour accéder rapidement aux principales sections du back-office.</p>
        </article>
      </section>
    </div>
  )
}
