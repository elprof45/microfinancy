'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'ADMIN' | 'CAISSIER' | 'COLLECTEUR'

export interface User {
  id: string | number
  email: string
  nom: string
  role: UserRole
  agenceId?: string | number
  societeId?: string | number
  isActive?: boolean
  lastLogin?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nom: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        // Try to get current user from localStorage (if JWT is stored there temporarily)
        // For httpOnly cookies, we'll verify by making a request to a protected endpoint
        const response = await fetch('http://localhost:3030/users', {
          credentials: 'include', // Include cookies
        })

        if (response.ok) {
          const data = await response.json()
          const users = data.data || data
          // Extract current user from response (assuming first call returns array)
          // In production, you might have a GET /auth/me endpoint
          console.log('Auth check: user session active')
        } else if (response.status === 401) {
          // Not authenticated
          setUser(null)
        }
      } catch (error) {
        console.log('Auth check failed:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3030/auth/login', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      const userData: User = {
        id: data.user?.id || '',
        email: data.user?.email || email,
        nom: data.user?.nom || '',
        role: data.user?.role || 'COLLECTEUR',
        agenceId: data.user?.agenceId,
        societeId: data.user?.societeId,
        isActive: data.user?.isActive,
      }

      setUser(userData)
      // Token is stored in httpOnly cookie automatically by server
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, nom: string, role: UserRole) => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3030/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nom, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      const data = await response.json()
      const userData: User = {
        id: data.user?.id || '',
        email: data.user?.email || email,
        nom: data.user?.nom || nom,
        role: data.user?.role || role,
        agenceId: data.user?.agenceId,
        societeId: data.user?.societeId,
        isActive: data.user?.isActive,
      }

      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await fetch('http://localhost:3030/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3030/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
