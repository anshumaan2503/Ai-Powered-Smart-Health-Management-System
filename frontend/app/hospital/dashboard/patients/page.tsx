'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { patientsAPI, hospitalAPI } from '@/lib/api'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useSWR, { useSWRConfig } from 'swr'
import { debounce } from 'lodash'

// 🚀 Dynamic Islands: These modules are ONLY loaded when needed
const ImportPatientsModal = dynamic(() => import('@/components/hospital/patients/ImportModal').then(mod => mod.ImportPatientsModal), { ssr: false })
const DeletePatientModal = dynamic(() => import('@/components/hospital/patients/DeleteModal').then(mod => mod.DeletePatientModal), { ssr: false })
const BulkDeleteModal = dynamic(() => import('@/components/hospital/patients/BulkDeleteModal').then(mod => mod.BulkDeleteModal), { ssr: false })

// ⚡ Direct Path Icons: Reduces graph from 300+ modules to 11
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon'
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon'
import PlusIcon from '@heroicons/react/24/outline/PlusIcon'
import EyeIcon from '@heroicons/react/24/outline/EyeIcon'
import PencilIcon from '@heroicons/react/24/outline/PencilIcon'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon'
import UserIcon from '@heroicons/react/24/outline/UserIcon'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon'

interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  age: number
  gender: string
  blood_group: string
  created_at: string
}

export default function HospitalPatientsPage() {
  const { mutate: globalMutate } = useSWRConfig()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search term to prevent excessive API calls
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value)
      setCurrentPage(1)
    }, 400),
    []
  )

  const [showFilters, setShowFilters] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; patient: Patient | null }>({
    show: false,
    patient: null
  })
  const [deleting, setDeleting] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<number[]>([])
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [addingSample, setAddingSample] = useState(false)

  const router = useRouter()

  const { data: patientsResponse, error: fetchError, mutate } = useSWR(
    ['hospital-patients', currentPage, debouncedSearchTerm, filterGender, filterBloodGroup],
    () => hospitalAPI.getPatients({
      page: currentPage,
      per_page: 10,
      search: debouncedSearchTerm,
      gender: filterGender,
      blood_group: filterBloodGroup
    }),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      revalidateOnReconnect: true
    }
  )

  const patients: Patient[] = patientsResponse?.data?.patients || []
  const totalPages = patientsResponse?.data?.pages || 1
  const loading = !patientsResponse && !fetchError

  useEffect(() => {
    if (fetchError?.response?.status === 401) {
      router.push('/hospital/login')
    }
  }, [fetchError, router])

  const fetchPatients = () => {
    mutate()
    globalMutate('dashboard-analytics')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    debouncedSetSearch(e.target.value)
  }

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'gender') {
      setFilterGender(value)
    } else if (type === 'blood_group') {
      setFilterBloodGroup(value)
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterGender('')
    setFilterBloodGroup('')
    setCurrentPage(1)
  }

  const handleDeleteClick = (patient: Patient) => {
    setDeleteModal({ show: true, patient })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.patient) return
    const patientId = deleteModal.patient.id
    const currentKey = ['hospital-patients', currentPage, debouncedSearchTerm, filterGender, filterBloodGroup]

    // Optimistic Update: Remove from local cache immediately
    mutate(
      (prevResponse: any) => {
        if (!prevResponse?.data?.patients) return prevResponse
        return {
          ...prevResponse,
          data: {
            ...prevResponse.data,
            patients: prevResponse.data.patients.filter((p: Patient) => p.id !== patientId),
            total: (prevResponse.data.total || 0) - 1
          }
        }
      },
      false
    )

    setDeleteModal({ show: false, patient: null })

    try {
      setDeleting(true)
      await patientsAPI.deletePatient(patientId)
      toast.success('Patient deleted successfully')
      fetchPatients()
    } catch (error: any) {
      // Rollback on error
      mutate()
      console.error('Error deleting patient:', error)
      toast.error(error.response?.data?.error || 'Failed to delete patient')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, patient: null })
  }

  const handleSelectPatient = (patientId: number) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(patients.map(p => p.id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedPatients.length === 0) return
    setBulkDeleteModal(true)
  }

  const handleBulkDeleteConfirm = async () => {
    const currentKey = ['hospital-patients', currentPage, debouncedSearchTerm, filterGender, filterBloodGroup]
    const idsToDelete = [...selectedPatients]

    // Optimistic Update: Remove from local cache immediately
    mutate(
      (prevResponse: any) => {
        if (!prevResponse?.data?.patients) return prevResponse
        return {
          ...prevResponse,
          data: {
            ...prevResponse.data,
            patients: prevResponse.data.patients.filter((p: Patient) => !idsToDelete.includes(p.id)),
            total: (prevResponse.data.total || 0) - idsToDelete.length
          }
        }
      },
      false
    )

    setBulkDeleteModal(false)
    setSelectedPatients([])

    try {
      setBulkDeleting(true)

      // Use the new bulk delete endpoint for performance
      await hospitalAPI.bulkDeletePatients(idsToDelete)

      toast.success(`${idsToDelete.length} patient(s) deleted successfully`)
      fetchPatients()
    } catch (error: any) {
      // Rollback on error
      mutate()
      console.error('Error deleting patients:', error)
      toast.error(error.response?.data?.error || error.message || 'Failed to delete patients')
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleBulkDeleteCancel = () => {
    setBulkDeleteModal(false)
  }

  const getGenderColor = (gender: string) => {
    if (!gender) return 'bg-gray-100 text-gray-800'
    return gender.toLowerCase() === 'male'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-pink-100 text-pink-800'
  }

  const getBloodGroupColor = (bloodGroup: string) => {
    if (!bloodGroup) return 'bg-gray-100 text-gray-800'
    const colors: { [key: string]: string } = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-green-200 text-green-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-orange-100 text-orange-800',
      'O-': 'bg-orange-200 text-orange-900'
    }
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800'
  }

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

  const handleImport = async () => {
    if (!importFile) return

    try {
      setImporting(true)

      const formData = new FormData()
      formData.append('file', importFile)

      const response = await hospitalAPI.importPatients(formData)

      setImportResults({
        success: response.data.success || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || []
      })

      if (response.data.success > 0) {
        toast.success(`Import completed: ${response.data.success} patients imported`)
        fetchPatients()
      } else if (response.data.failed > 0) {
        toast(`Import completed: ${response.data.success} patients imported, ${response.data.failed} failed`, {
          icon: '⚠️',
          duration: 4000
        })
      }
    } catch (error: any) {
      console.error('Import error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to import patients'
      toast.error(errorMessage)
      setImportResults({
        success: 0,
        failed: 1,
        errors: [errorMessage]
      })
    } finally {
      setImporting(false)
    }
  }

  const handleAddSamplePatients = async () => {
    try {
      setAddingSample(true)
      const response = await hospitalAPI.addSamplePatients()
      toast.success(response.data.message || 'Sample patients added successfully')
      fetchPatients()
    } catch (error: any) {
      console.error('Error adding sample patients:', error)
      toast.error(error.response?.data?.error || 'Failed to add sample patients')
    } finally {
      setAddingSample(false)
    }
  }

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
            Patient Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage patient records and information
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleAddSamplePatients}
            disabled={addingSample}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg font-medium hover:bg-green-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {addingSample ? (
              <LoadingSpinner size="sm" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            <span>{addingSample ? 'Processing...' : 'Add Sample Data'}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 transition-all shadow-sm active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Import CSV</span>
          </button>
          <Link
            href="/hospital/dashboard/patients/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Patient
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients by name, ID, phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center ${showFilters ? 'bg-blue-100 text-blue-700' : ''}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            {(filterGender || filterBloodGroup || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={filterBloodGroup}
                  onChange={(e) => handleFilterChange('blood_group', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
        </m.div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPatients.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-900">
              {selectedPatients.length} patient(s) selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPatients([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn-danger flex items-center text-sm"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </button>
          </div>
        </m.div>
      )}

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterGender || filterBloodGroup
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first patient'}
            </p>
            <Link href="/hospital/dashboard/patients/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Patient
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPatients.length === patients.length && patients.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient, index) => (
                    <PatientRow
                      key={patient.id}
                      patient={patient}
                      index={index}
                      isSelected={selectedPatients.includes(patient.id)}
                      onSelect={handleSelectPatient}
                      onDelete={handleDeleteClick}
                      getGenderColor={getGenderColor}
                      getBloodGroupColor={getBloodGroupColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {patients.map((patient, index) => (
                <m.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelectPatient(patient.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {patient.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/hospital/dashboard/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/hospital/dashboard/patients/${patient.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(patient)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Details</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(patient.gender)}`}>
                          {patient.gender}
                        </span>
                        {patient.blood_group && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.blood_group)}`}>
                            {patient.blood_group}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Age: {patient.age}</p>
                    </div>
                  </div>
              </m.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary rounded-r-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary rounded-l-none border-l-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Import CSV Modal - Refactored for performance */}
      <ImportPatientsModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        importFile={importFile}
        setImportFile={setImportFile}
        importing={importing}
        importResults={importResults}
        setImportResults={setImportResults}
      />

      {/* Delete Confirmation Modal */}
      <DeletePatientModal 
        isOpen={deleteModal.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        patientName={deleteModal.patient?.full_name || ''}
        deleting={deleting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteModal 
        isOpen={bulkDeleteModal}
        onClose={handleBulkDeleteCancel}
        onConfirm={handleBulkDeleteConfirm}
        selectedCount={selectedPatients.length}
        deleting={bulkDeleting}
      />
    </div>
    </LazyMotion>
  )
}

// Memoized Row component to prevent unnecessary re-renders
const PatientRow = memo(({ 
  patient, 
  index, 
  isSelected, 
  onSelect, 
  onDelete, 
  getGenderColor, 
  getBloodGroupColor 
}: { 
  patient: any; 
  index: number; 
  isSelected: boolean; 
  onSelect: (id: number) => void; 
  onDelete: (p: any) => void;
  getGenderColor: (g: string) => string;
  getBloodGroupColor: (bg: string) => string;
}) => {
  return (
    <m.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, delay: Math.min(index * 0.02, 0.2) }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(patient.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {patient.full_name}
            </div>
            <div className="text-sm text-gray-500 font-mono text-xs">
              ID: {patient.patient_id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="text-gray-900">{patient.email}</div>
        <div className="text-gray-500">{patient.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderColor(patient.gender)}`}>
            {patient.gender}
          </span>
          {patient.blood_group && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(patient.blood_group)}`}>
              {patient.blood_group}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Age: {patient.age}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(patient.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/hospital/dashboard/patients/${patient.id}`}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            href={`/hospital/dashboard/patients/${patient.id}/edit`}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Edit Patient"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => onDelete(patient)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete Patient"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </m.tr>
  )
})

PatientRow.displayName = 'PatientRow'