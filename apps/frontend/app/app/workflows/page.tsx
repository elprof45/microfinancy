'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useProtectedRoute } from '@/lib/use-protected-route'
import { useWorkflow } from '@/lib/use-workflow'
import { WorkflowStatusBadge } from '@/components/workflow-status-badge'
import { WorkflowModal } from '@/components/workflow-modal'

interface PendingApproval {
  id: string
  type: 'mouvement-epargne' | 'cotisation'
  status: string
  montant: number
  client: { nom: string }
  compte: { numero: string }
  creePar: { nom: string }
  dateCreation: string
  raison?: string
}

export default function WorkflowsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { hasPermission } = useProtectedRoute()
  const { getPendingApprovals, getPermissions } = useWorkflow()

  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'cancel'>('approve')

  const itemsPerPage = 10

  useEffect(() => {
    fetchApprovals()
  }, [currentPage])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getPendingApprovals(currentPage, itemsPerPage)

      if (!result) {
        throw new Error('Failed to fetch approvals')
      }

      setApprovals(result.data || [])
      setTotalItems(result.total || 0)
      setTotalPages(Math.ceil((result.total || 0) / itemsPerPage))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching approvals'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (approval: PendingApproval, action: 'approve' | 'reject' | 'cancel') => {
    setSelectedApproval(approval)
    setModalAction(action)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchApprovals()
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Only ADMIN and CAISSIER can access workflows
  if (!user || !['ADMIN', 'CAISSIER'].includes(user.role)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Access Denied</div>
          <p className="text-gray-600">Only administrators and cashiers can approve transactions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Approvals</h1>
        <p className="text-gray-600">Manage pending transactions for your agency</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading approvals...</div>
        </div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">No pending approvals</div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvals.map((approval) => {
                  const permissions = getPermissions(approval.status, user?.role)
                  return (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{approval.type}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium">{approval.client.nom}</div>
                        <div className="text-gray-500 text-xs">{approval.compte?.numero}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{approval.montant.toFixed(2)} F</td>
                      <td className="px-6 py-4 text-sm">
                        <WorkflowStatusBadge status={approval.status as any} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{approval.creePar?.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(approval.dateCreation).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        {permissions.canApprove && (
                          <button
                            onClick={() => handleActionClick(approval, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {permissions.canReject && (
                          <button
                            onClick={() => handleActionClick(approval, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            Reject
                          </button>
                        )}
                        {permissions.canCancel && (
                          <button
                            onClick={() => handleActionClick(approval, 'cancel')}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalItems} total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <WorkflowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        movementId={selectedApproval?.id || ''}
        currentStatus={selectedApproval?.status as any}
        action={modalAction}
        movementDetails={
          selectedApproval
            ? {
                Client: selectedApproval.client.nom,
                'Compte #': selectedApproval.compte?.numero,
                Montant: `${selectedApproval.montant.toFixed(2)} F`,
                'Créé par': selectedApproval.creePar?.nom,
              }
            : undefined
        }
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
