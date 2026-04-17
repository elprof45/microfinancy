'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export type WorkflowAction = 'approve' | 'reject' | 'cancel'

interface WorkflowPermissions {
  canApprove: boolean
  canReject: boolean
  canCancel: boolean
  allowedTransitions: string[]
}

/**
 * Hook for workflow operations
 * Provides methods to approve, reject, and cancel movements
 * Handles RBAC checks and API calls
 */
export function useWorkflow() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get workflow permissions for a movement based on user role and status
   */
  const getPermissions = (status: string, role?: string): WorkflowPermissions => {
    const userRole = role || user?.role || 'COLLECTEUR'

    if (status === 'EN_ATTENTE') {
      return {
        canApprove: ['ADMIN', 'CAISSIER'].includes(userRole),
        canReject: ['ADMIN', 'CAISSIER'].includes(userRole),
        canCancel: false,
        allowedTransitions: ['VALIDE', 'REJETE'],
      }
    }

    if (status === 'VALIDE') {
      return {
        canApprove: false,
        canReject: false,
        canCancel: userRole === 'ADMIN',
        allowedTransitions: ['ANNULE'],
      }
    }

    if (status === 'REJETE') {
      return {
        canApprove: ['ADMIN', 'CAISSIER'].includes(userRole),
        canReject: false,
        canCancel: false,
        allowedTransitions: ['VALIDE'],
      }
    }

    // ANNULE and REMBOURSE have no transitions
    return {
      canApprove: false,
      canReject: false,
      canCancel: false,
      allowedTransitions: [],
    }
  }

  /**
   * Approve a mouvement-epargne
   */
  const approveMovement = async (movementId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3030/workflows/mouvement-epargne/${movementId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to approve movement')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error approving movement'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reject a mouvement-epargne with optional reason
   */
  const rejectMovement = async (movementId: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3030/workflows/mouvement-epargne/${movementId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raison: reason || '' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to reject movement')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error rejecting movement'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancel a validated mouvement-epargne (admin only)
   */
  const cancelMovement = async (movementId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3030/workflows/mouvement-epargne/${movementId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to cancel movement')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error canceling movement'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get pending approvals
   */
  const getPendingApprovals = async (page: number = 1, limit: number = 10) => {
    try {
      const skip = (page - 1) * limit

      const response = await fetch(`http://localhost:3030/workflows/pending?skip=${skip}&take=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals')
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching pending approvals'
      setError(message)
      return null
    }
  }

  return {
    loading,
    error,
    approveMovement,
    rejectMovement,
    cancelMovement,
    getPendingApprovals,
    getPermissions,
  }
}
