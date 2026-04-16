'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, entityConfigs, entityKeys, type EntityKey } from '@/lib/api'

type EntityHealth = {
  key: EntityKey
  label: string
  status: 'ok' | 'error' | 'pending'
  count?: number
  message?: string
}

export default function ApiHealthTracker({ compact }: { compact?: boolean }) {
  const [statuses, setStatuses] = useState<EntityHealth[]>([])
  const [loading, setLoading] = useState(false)

  const entityList = useMemo(
    () => entityKeys.map((key) => ({ key, label: entityConfigs[key].label })),
    []
  )

  useEffect(() => {
    setLoading(true)
    const controller = new AbortController()

    Promise.all(
      entityList.map(async ({ key, label }) => {
        if (controller.signal.aborted) {
          return { key, label, status: 'pending' as const }
        }

        try {
          const response = await api.health(key)
          return {
            key,
            label,
            status: response.status,
            count: response.count,
            message: response.message,
          }
        } catch (error: any) {
          return {
            key,
            label,
            status: 'error' as const,
            message: error?.message || 'Indisponible',
          }
        }
      })
    )
      .then((result) => {
        setStatuses(result)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [entityList])

  const healthyCount = statuses.filter((item) => item.status === 'ok').length
  const totalCount = statuses.length
  const totalItems = statuses.reduce((sum, current) => sum + (current.count ?? 0), 0)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Suivi API</p>
          <h2 className="text-2xl font-semibold text-slate-900">État des endpoints</h2>
        </div>
        <div className="space-y-2 text-right text-sm text-slate-600">
          <p>{healthyCount}/{totalCount} endpoints disponibles</p>
          <p>{totalItems} éléments totaux chargés</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statuses.map((item) => (
          <div key={item.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">/{entityConfigs[item.key].apiPath}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                item.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {item.status === 'ok' ? 'OK' : 'Erreur'}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
              <p>{item.count !== undefined ? `${item.count} items` : 'Aucun comptage'}</p>
              <p>{item.message ?? ''}</p>
            </div>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <p>Le tableau est actualisé à l’ouverture de la page. Rechargez pour faire une vérification manuelle.</p>
          <p>
            Voir la page détaillée de statistiques :{' '}
            <Link href="/stats" className="font-semibold text-slate-900 hover:text-slate-700">
              /stats
            </Link>
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Chargement des statuts API...</div>
      ) : null}
    </div>
  )
}
