'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

export function NavBar() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200"></div>
        </div>
      </header>
    )
  }

  // Show login link if not authenticated
  if (!isAuthenticated) {
    return (
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Microfinancy</p>
            <h1 className="text-xl font-semibold text-slate-900">Interface de gestion</h1>
          </div>
          <Link
            href="/auth/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Se connecter
          </Link>
        </div>
      </header>
    )
  }

  // Show authenticated navigation
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Microfinancy</p>
          <h1 className="text-xl font-semibold text-slate-900">Interface de gestion</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-700">
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app">
            Accueil
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/societes">
            Sociétés
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/agences">
            Agences
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/users">
            Utilisateurs
          </Link>

          {/* Role-based menu items */}
          {(user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
            <>
              <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/comptes">
                Comptes
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/workflows">
                Workflows
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/reports">
                Rapports
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-slate-100" href="/app/bulk">
                Import en masse
              </Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
              {user?.nom?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs text-slate-500">{user?.role}</p>
              <p className="font-medium text-slate-900">{user?.nom}</p>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">Connecté en tant que</p>
                <p className="font-medium text-slate-900">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1">Rôle: {user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
