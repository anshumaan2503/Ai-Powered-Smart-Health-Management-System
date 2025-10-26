'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ImportResult {
  imported_count: number
  error_count: number
  imported_staff: Array<{
    name: string
    email: string
    password: string
    role: string
  }>
  errors: string[]
}

export default function ImportStaffPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(selectedFile.type) && 
          !selectedFile.name.toLowerCase().endsWith('.csv') &&
          !selectedFile.name.toLowerCase().endsWith('.xlsx') &&
          !selectedFile.name.toLowerCase().endsWith('.xls')) {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('Please login first')
        return
      }

      const response = await fetch('http://localhost:5000/api/hospital/import-staff-template', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get template')
      }

      const data = await response.json()
      
      // Create CSV content
      const headers = ['first_name', 'last_name', 'role', 'phone']
      const csvContent = [
        headers.join(','),
        ...data.template.first_name.map((_: any, index: number) => 
          headers.map(header => data.template[header][index] || '').join(',')
        )
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'staff_import_template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template')
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setImportResult(null)

    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('Please login first')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:5000/api/hospital/import-staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import staff')
      }

      setImportResult(data)
      setSuccess(data.message)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import staff')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = (staff: any) => {
    const text = `Name: ${staff.name}\nEmail: ${staff.email}\nPassword: ${staff.password}`
    navigator.clipboard.writeText(text)
  }

  const copyAllCredentials = () => {
    if (!importResult) return
    
    const allCredentials = importResult.imported_staff.map(staff => 
      `Name: ${staff.name}\nEmail: ${staff.email}\nPassword: ${staff.password}\nRole: ${staff.role}`
    ).join('\n\n')
    
    navigator.clipboard.writeText(allCredentials)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <Link
            href="/hospital/dashboard/staff"
            className="p-2 rounded-lg bg-purple-500 bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Import Staff</h1>
            <p className="text-purple-100 text-lg">Bulk import staff members from CSV or Excel file</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Import Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Required Columns:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• first_name</li>
              <li>• last_name</li>
              <li>• role</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Optional Columns:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• phone</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Email and password will be automatically generated for each staff member. 
            All passwords will be set to "123". You can modify them later from the staff member's profile page.
          </p>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
          <button
            onClick={downloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Download Template</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV or Excel File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>Import Staff</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">{importResult.imported_count}</p>
                    <p className="text-sm text-green-700">Successfully Imported</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-red-900">{importResult.error_count}</p>
                    <p className="text-sm text-red-700">Errors</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CloudArrowUpIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{importResult.imported_count + importResult.error_count}</p>
                    <p className="text-sm text-blue-700">Total Processed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imported Staff */}
          {importResult.imported_staff.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Credentials</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    {showPasswords ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
                  </button>
                  <button
                    onClick={copyAllCredentials}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Copy All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Password</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.imported_staff.map((staff, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 font-medium">{staff.name}</td>
                        <td className="py-2 font-mono text-blue-600">{staff.email}</td>
                        <td className="py-2 font-mono">
                          {showPasswords ? staff.password : '••••••••'}
                        </td>
                        <td className="py-2">{staff.role}</td>
                        <td className="py-2">
                          <button
                            onClick={() => copyCredentials(staff)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Copy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Errors</h3>
              <div className="space-y-2">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/hospital/dashboard/staff"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              View All Staff
            </Link>
            <button
              onClick={() => {
                setFile(null)
                setImportResult(null)
                setSuccess('')
                setError('')
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  )
}