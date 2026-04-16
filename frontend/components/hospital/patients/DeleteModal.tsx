'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName: string
  deleting: boolean
}

export function DeletePatientModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  deleting
}: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Patient</h3>
        <p className="text-gray-500 text-center text-sm mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-900">{patientName}</span>? 
          This action is permanent and cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button onClick={onClose} disabled={deleting} className="flex-1 btn-secondary py-2.5">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 flex justify-center">
            {deleting ? <LoadingSpinner size="sm" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
