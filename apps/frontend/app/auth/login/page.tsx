'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/app')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Basic validation
      if (!email || !password) {
        setError('Email et mot de passe sont requis')
        setIsSubmitting(false)
        return
      }

      if (!email.includes('@')) {
        setError('Email invalide')
        setIsSubmitting(false)
        return
      }

      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setIsSubmitting(false)
        return
      }

      await login(email, password)
      router.push('/app')
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Microphina</h2>
          <p className="mt-2 text-sm text-slate-400">Système de Gestion Microfinancier</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <h3 className="mb-6 text-xl font-semibold text-white">Connexion</h3>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                placeholder="admin@microphina.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="text-xs text-slate-500">OU</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          {/* Demo Credentials Info */}
          <div className="rounded-md bg-slate-700/50 p-4 text-sm text-slate-300 border border-slate-600">
            <p className="font-semibold mb-2">Identifiants de démonstration:</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Email:</strong> admin@test.com</li>
              <li><strong>Mot de passe:</strong> Admin123456</li>
            </ul>
          </div>

          {/* Register Link */}
          <p className="mt-4 text-center text-sm text-slate-400">
            Pas encore inscrit?{' '}
            <Link href="/auth/register" className="font-medium text-blue-400 hover:text-blue-300">
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© 2026 Microphina. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
