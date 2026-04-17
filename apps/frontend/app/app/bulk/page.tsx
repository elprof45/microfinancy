'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useProtectedRoute } from '@/lib/use-protected-route'
import { BulkImportModal } from '@/components/bulk-import-modal'

export default function BulkImportPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { hasPermission } = useProtectedRoute()

  const [modalOpen, setModalOpen] = useState(false)
  const [importType, setImportType] = useState<'clients' | 'cotisations'>('clients')

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Only ADMIN can access bulk import
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Access Denied</div>
          <p className="text-gray-600">Only administrators can use bulk import.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Import</h1>
        <p className="text-gray-600">Import multiple clients or contributions at once</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import Clients</h2>
            <p className="text-gray-600 text-sm mt-1">
              Upload a JSON or CSV file to import multiple clients at once. Each client will automatically get a savings
              account and passbook created.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Expected Format:</h3>
              <p className="text-sm text-blue-800 mb-2">JSON:</p>
              <pre className="text-xs bg-white p-2 rounded border border-blue-100 overflow-x-auto mb-2">
{`[
  {
    "nom": "John Doe",
    "telephone": "1234567890",
    "email": "john@example.com"
  }
]`}
              </pre>
              <p className="text-sm text-blue-800">CSV:</p>
              <pre className="text-xs bg-white p-2 rounded border border-blue-100 overflow-x-auto">
{`nom,telephone,email
John Doe,1234567890,john@example.com`}
              </pre>
            </div>

            <button
              onClick={() => {
                setImportType('clients')
                setModalOpen(true)
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Choose File to Import Clients
            </button>
          </div>
        </div>

        {/* Import Cotisations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import Cotisations</h2>
            <p className="text-gray-600 text-sm mt-1">
              Upload a JSON or CSV file to import monthly contributions. These will be linked to existing client accounts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-900 mb-2">Expected Format:</h3>
              <p className="text-sm text-green-800 mb-2">JSON:</p>
              <pre className="text-xs bg-white p-2 rounded border border-green-100 overflow-x-auto mb-2">
{`[
  {
    "clientId": "client-uuid",
    "montant": 50000,
    "mois": 1,
    "annee": 2026
  }
]`}
              </pre>
              <p className="text-sm text-green-800">CSV:</p>
              <pre className="text-xs bg-white p-2 rounded border border-green-100 overflow-x-auto">
{`clientId,montant,mois,annee
client-uuid,50000,1,2026`}
              </pre>
            </div>

            <button
              onClick={() => {
                setImportType('cotisations')
                setModalOpen(true)
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Choose File to Import Cotisations
            </button>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">Important Notes:</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>
            • <strong>File Size:</strong> Maximum 5MB per file
          </li>
          <li>
            • <strong>Formats:</strong> JSON or CSV only
          </li>
          <li>
            • <strong>Validation:</strong> Invalid rows will be reported, but valid rows will be imported
          </li>
          <li>
            • <strong>Uniqueness:</strong> Duplicate entries will be updated if they already exist
          </li>
          <li>
            • <strong>Audit:</strong> All imports are logged for compliance and can be reviewed later
          </li>
        </ul>
      </div>

      <BulkImportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        importType={importType}
        onSuccess={(result) => {
          // Show success message or refresh data
          console.log('Import successful:', result)
        }}
      />
    </div>
  )
}
