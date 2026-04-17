'use client'

import { useState } from 'react'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  importType: 'clients' | 'cotisations'
  onSuccess?: (result: any) => void
}

export function BulkImportModal({
  isOpen,
  onClose,
  importType,
  onSuccess,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
        setError('File must be JSON or CSV format')
        return
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const endpoint =
        importType === 'clients'
          ? 'http://localhost:3030/bulk/import-clients'
          : 'http://localhost:3030/bulk/import-cotisations'

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to import ${importType}`)
      }

      const resultData = await response.json()
      setResult(resultData)
      onSuccess?.(resultData)
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error importing ${importType}`
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isSuccess = result && !error
  const labels = {
    clients: {
      title: 'Bulk Import Clients',
      description: 'Upload a JSON or CSV file to import multiple clients',
      button: 'Import Clients',
      successMessage: 'Clients imported successfully!',
    },
    cotisations: {
      title: 'Bulk Import Cotisations',
      description: 'Upload a JSON or CSV file to import monthly contributions',
      button: 'Import Cotisations',
      successMessage: 'Cotisations imported successfully!',
    },
  }

  const label = labels[importType]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-2">{label.title}</h2>
        <p className="text-gray-600 text-sm mb-4">{label.description}</p>

        {isSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <div className="text-green-800 text-sm">
              <p className="font-semibold mb-2">{label.successMessage}</p>
              {result.summary && (
                <ul className="space-y-1">
                  <li>✓ Created: {result.summary.created || 0}</li>
                  <li>⚠ Updated: {result.summary.updated || 0}</li>
                  <li>✕ Failed: {result.summary.failed || 0}</li>
                </ul>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-2">Errors:</p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((err: any, i: number) => (
                      <li key={i}>
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (JSON or CSV) *
              </label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Max 5MB. JSON or CSV format.</p>
            </div>

            {file && (
              <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  setFile(null)
                  setError(null)
                  setResult(null)
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {isSuccess ? 'Close' : 'Cancel'}
              </button>
              {!isSuccess && (
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Importing...' : label.button}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
