'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        router.push('/auth/login')
      }
    }

    handleLogout()
  }, [logout, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
        <p className="text-slate-600">Déconnexion en cours...</p>
      </div>
    </div>
  )
}
