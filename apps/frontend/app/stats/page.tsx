import ApiHealthTracker from '@/components/ApiHealthTracker'
import Link from 'next/link'

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Statistiques générales</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Vue d’ensemble du système</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Suivi des endpoints API, des compteurs d’éléments et de la disponibilité des ressources exposées par le backend.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Retour au dashboard
          </Link>
          <Link href="/societes" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Aller aux sociétés
          </Link>
        </div>
      </div>

      <ApiHealthTracker />
    </div>
  )
}
