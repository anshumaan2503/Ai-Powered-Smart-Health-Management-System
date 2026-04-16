'use client'

import { 
  XMarkIcon, 
  CloudArrowUpIcon, 
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  importing: boolean
  importResults: any
  setImportResults: (results: any) => void
}

export function ImportPatientsModal({
  isOpen,
  onClose,
  onImport,
  importFile,
  setImportFile,
  importing,
  importResults,
  setImportResults
}: ImportModalProps) {
  if (!isOpen) return null

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,date_of_birth,gender,phone,email,address,blood_group
John,Doe,15-01-1990,Male,9876543210,john.doe@example.com,"123 Main St, City, 12345",O+
Jane,Smith,25-12-1985,Female,9876543211,jane.smith@example.com,"456 Oak Ave, Town, 67890",A+`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patients_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Import Patients</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {!importResults ? (
            <>
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="csv-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-500">
                    Click to upload
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                {importFile && <p className="mt-2 text-xs text-blue-600">Selected: {importFile.name}</p>}
              </div>
              <button onClick={downloadTemplate} className="text-xs text-blue-600 mb-4 flex items-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Template
              </button>
              <div className="flex space-x-3">
                <button onClick={onClose} className="flex-1 btn-secondary text-sm">Cancel</button>
                <button onClick={onImport} disabled={!importFile || importing} className="flex-1 btn-primary text-sm flex justify-center">
                  {importing ? <LoadingSpinner size="sm" /> : 'Import'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-4">✅ {importResults.success} imported</p>
              <button onClick={() => { onClose(); setImportResults(null); }} className="w-full btn-primary">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
