'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { api, entityConfigs, type EntityConfig, type EntityKey } from '@/lib/api'
import { formatFormData, validateObject, validationSchemas, mapBackendErrors } from '@/lib/validation'
import { AlertTriangle, Loader2, PlusCircle, Search, X } from 'lucide-react'

function createEmptyForm(config: EntityConfig) {
  return config.fields.reduce<Record<string, unknown>>((form, field) => {
    form[field.name] = ''
    return form
  }, {})
}

type EntityPageProps = {
  entitySlug: string
}

export default function EntityPage({ entitySlug }: EntityPageProps) {
  const { user } = useAuth()
  const config = (entityConfigs as Record<string, EntityConfig>)[entitySlug]
  const [items, setItems] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>(() =>
    config ? createEmptyForm(config) : {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const schema = validationSchemas[entitySlug] || {}
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    if (!config) return
    setForm(createEmptyForm(config))
    setSelected(null)
    setErrors({})
    setMessage('')
    setMessageType('')
    setCurrentPage(1)
    loadList(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const formTitle = selected ? `Modifier ${config?.label ?? 'élément'}` : `Créer ${config?.label ?? 'élément'}`

  async function loadList(page: number = 1) {
    if (!config) return
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const skip = (page - 1) * itemsPerPage
      const take = itemsPerPage
      
      // Build query string with pagination parameters
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        take: take.toString(),
        ...(searchQuery && { search: searchQuery }),
      }).toString()

      const response = await fetch(
        `http://localhost:3030/${config.apiPath}?${queryParams}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expirée, veuillez vous reconnecter')
          setMessageType('error')
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Handle different response formats
      const itemsData = data.data || data
      const total = data.total || (Array.isArray(itemsData) ? itemsData.length : 0)
      
      setItems(Array.isArray(itemsData) ? itemsData : [])
      setTotalItems(total)
      setCurrentPage(page)
    } catch (error: any) {
      setMessage(error?.message || 'Impossible de charger la liste')
      setMessageType('error')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function editItem(item: any) {
    setSelected(item)
    setForm({ ...createEmptyForm(config), ...item })
    setMessage('')
    setMessageType('')
    setErrors({})
  }

  function resetForm() {
    setSelected(null)
    setForm(createEmptyForm(config))
    setErrors({})
    setMessage('')
    setMessageType('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!config) return

    // Client-side validation
    const validation = validateObject(form, schema)
    if (validation) {
      setErrors(validation)
      setMessage('Veuillez corriger les erreurs du formulaire')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const payload = formatFormData(form, schema)
      if (selected) {
        await api.update(entitySlug as EntityKey, selected.id, payload)
        setMessage('Modifié avec succès')
      } else {
        await api.create(entitySlug as EntityKey, payload)
        setMessage('Créé avec succès')
      }
      setMessageType('success')
      resetForm()
      await loadList(1)
    } catch (error: any) {
      // Map backend validation errors to form fields
      if (error.details && Array.isArray(error.details)) {
        const mappedErrors = mapBackendErrors(error.details)
        setErrors(mappedErrors)
      }
      setMessage(error?.message || 'Erreur lors de l\'envoi')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number | string) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return
    }
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      await api.remove(entitySlug as EntityKey, id)
      setMessage('Supprimé avec succès')
      setMessageType('success')
      if (selected?.id === id) {
        resetForm()
      }
      await loadList(1)
    } catch (error: any) {
      setMessage(error?.message || 'Erreur pendant la suppression')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Check if user can perform this action
  const canCreate = user?.role === 'ADMIN' || user?.role === 'CAISSIER'
  const canDelete = user?.role === 'ADMIN'

  if (!config) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          <h1 className="text-2xl font-semibold">Page introuvable</h1>
          <p>Cette ressource n'est pas gérée par l'interface actuelle.</p>
          <Link className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm text-white" href="/app">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Gestion</p>
          <h1 className="text-3xl font-semibold text-slate-900">{config.label}</h1>
          <p className="mt-2 text-slate-600">Liste, création, modification et suppression via l'API backend.</p>
        </div>
        <Link href="/app" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          Retour au tableau de bord
        </Link>
      </div>

      {message ? (
        <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${messageType === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{config.label} existants</h2>
              <p className="text-sm text-slate-500">{items.length} / {totalItems} éléments</p>
            </div>
            {canCreate && (
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800" onClick={resetForm}>
                <PlusCircle className="h-4 w-4" /> Nouveau
              </button>
            )}
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans tous les champs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="p-1 hover:bg-slate-200 rounded-full transition"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  {config.listColumns.map((column) => (
                    <th key={column} className="px-4 py-3 capitalize">{column.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={config.listColumns.length + 2} className="px-4 py-10 text-center text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" /> Chargement en cours...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={config.listColumns.length + 2} className="px-4 py-10 text-center text-slate-500">
                      {searchQuery ? 'Aucun résultat trouvé.' : 'Aucun élément trouvé.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{item.id}</td>
                      {config.listColumns.map((column) => (
                        <td key={column} className="px-4 py-3 text-slate-600">{String(item[column] ?? '')}</td>
                      ))}
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex flex-wrap gap-2">
                          {canCreate && (
                            <button type="button" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200" onClick={() => editItem(item)}>
                              Modifier
                            </button>
                          )}
                          {canDelete && (
                            <button type="button" className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200" onClick={() => handleDelete(item.id)}>
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <div className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages} ({totalItems} résultats)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => loadList(currentPage - 1)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => loadList(currentPage + 1)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </section>

        {canCreate && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{formTitle}</h2>
                <p className="text-sm text-slate-500">Remplissez les champs nécessaires puis validez.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">{selected ? 'Édition' : 'Création'}</span>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {config.fields.map((field) => {
                const value = form[field.name] ?? ''
                const error = errors[field.name]
                const inputId = `field-${field.name}`

                return (
                  <div key={field.name}>
                    <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required ? ' *' : ''}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={inputId}
                        value={String(value)}
                        placeholder={field.placeholder}
                        onChange={(event) => setField(field.name, event.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                          error
                            ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
                        }`}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={inputId}
                        value={String(value)}
                        onChange={(event) => setField(field.name, event.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                          error
                            ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
                        }`}
                      >
                        <option value="">Choisir...</option>
                        {field.options?.map((option) => (
                          <option key={String(option.value)} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={inputId}
                        type={field.type === 'number' ? 'number' : field.type}
                        value={String(value)}
                        placeholder={field.placeholder}
                        onChange={(event) => setField(field.name, event.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                          error
                            ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
                        }`}
                      />
                    )}
                    {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
                  </div>
                )
              })}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
                >
                  {loading ? 'En cours...' : selected ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" onClick={resetForm} className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 sm:w-auto">
                  Réinitialiser
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}
