'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/use-workflow'

interface WorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  movementId: string
  currentStatus: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ANNULE' | 'REMBOURSE'
  action: 'approve' | 'reject' | 'cancel'
  movementDetails?: Record<string, any>
  onSuccess?: () => void
}

export function WorkflowModal({
  isOpen,
  onClose,
  movementId,
  currentStatus,
  action,
  movementDetails,
  onSuccess,
}: WorkflowModalProps) {
  const { approveMovement, rejectMovement, cancelMovement, loading, error } = useWorkflow()
  const [reason, setReason] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    let success = false

    if (action === 'approve') {
      success = await approveMovement(movementId)
    } else if (action === 'reject') {
      if (!reason.trim()) {
        setLocalError('Please provide a reason for rejection')
        return
      }
      success = await rejectMovement(movementId, reason)
    } else if (action === 'cancel') {
      success = await cancelMovement(movementId)
    }

    if (success) {
      setReason('')
      onSuccess?.()
      onClose()
    }
  }

  const actionLabels = {
    approve: {
      title: 'Approve Movement',
      button: 'Approve',
      color: 'bg-green-600 hover:bg-green-700',
    },
    reject: {
      title: 'Reject Movement',
      button: 'Reject',
      color: 'bg-red-600 hover:bg-red-700',
    },
    cancel: {
      title: 'Cancel Movement',
      button: 'Cancel',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  }

  const labels = actionLabels[action]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{labels.title}</h2>

        {movementDetails && (
          <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(movementDetails).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold text-gray-600">{key}:</span>
                  <span className="text-gray-800 ml-2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-800">
            Current Status: <strong>{currentStatus}</strong>
          </p>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error || localError}
          </div>
        )}

        {action === 'reject' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this movement is being rejected..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">This reason will be sent to the applicant.</p>
          </div>
        )}

        {action === 'cancel' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ This will cancel the approved movement. This action cannot be undone.
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-md ${labels.color} disabled:opacity-50`}
          >
            {loading ? '...' : labels.button}
          </button>
        </div>
      </div>
    </div>
  )
}
