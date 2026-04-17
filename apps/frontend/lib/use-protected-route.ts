'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from './auth-context'

interface UseProtectedRouteOptions {
  requiredRoles?: UserRole[]
  redirectTo?: string
}

/**
 * Hook to protect pages from unauthenticated and unauthorized access
 * Redirects to login if not authenticated, or shows error if insufficient permissions
 */
export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { requiredRoles = [], redirectTo = '/auth/login' } = options
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Check role if required
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
      router.push('/access-denied')
      return
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission: requiredRoles.length === 0 || (user && requiredRoles.includes(user.role)),
  }
}
