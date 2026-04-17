'use client'

import { useParams } from 'next/navigation'
import EntityPage from '@/components/EntityPage'
import { useProtectedRoute } from '@/lib/use-protected-route'

export default function EntityPageWrapper() {
  const params = useParams()
  const entity = params.entity as string
  const { isLoading } = useProtectedRoute()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200 mb-4"></div>
          <div className="h-4 w-full animate-pulse rounded bg-slate-200 mb-2"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
        </div>
      </div>
    )
  }

  return <EntityPage entitySlug={entity} />
}
