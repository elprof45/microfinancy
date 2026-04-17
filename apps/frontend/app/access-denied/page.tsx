'use client'

import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-2">Accès refusé</h1>
        <p className="text-red-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="space-y-3">
          <Link
            href="/app"
            className="block rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition"
          >
            Retour au tableau de bord
          </Link>
          <Link
            href="/auth/logout"
            className="block rounded-lg border border-red-300 bg-white px-4 py-2 text-red-600 font-medium hover:bg-red-50 transition"
          >
            Se déconnecter
          </Link>
        </div>
      </div>
    </div>
  )
}
