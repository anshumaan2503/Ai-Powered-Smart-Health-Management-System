'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { patientsAPI } from '@/lib/api'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import toast from 'react-hot-toast'

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; patient: Patient | null }>({
    show: false,
    patient: null
  })
  const [deleting, setDeleting] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<number[]>([])
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchPatients()
  }, [currentPage, searchTerm, filterGender, filterBloodGroup])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        gender: filterGender,
        blood_group: filterBloodGroup
      }
      
      const response = await patientsAPI.getAll(params)
      setPatients(response.data.patients || [])
      setTotalPages(response.data.pages || 1)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
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

  const getGenderColor = (gender: string) => {
    return gender.toLowerCase() === 'male' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-pink-100 text-pink-800'
  }

  const getBloodGroupColor = (bloodGroup: string) => {
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

  const handleDeleteClick = (patient: Patient) => {
    setDeleteModal({ show: true, patient })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.patient) return

    try {
      setDeleting(true)
      await patientsAPI.delete(deleteModal.patient.id)
      
      toast.success('Patient deleted successfully')
      setDeleteModal({ show: false, patient: null })
      
      // Refresh the patients list
      fetchPatients()
    } catch (error: any) {
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
    try {
      setBulkDeleting(true)
      
      // Delete patients one by one
      for (const patientId of selectedPatients) {
        await patientsAPI.delete(patientId)
      }
      
      toast.success(`${selectedPatients.length} patient(s) deleted successfully`)
      setBulkDeleteModal(false)
      setSelectedPatients([])
      
      // Refresh the patients list
      fetchPatients()
    } catch (error: any) {
      console.error('Error deleting patients:', error)
      toast.error(error.response?.data?.error || 'Failed to delete patients')
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleBulkDeleteCancel = () => {
    setBulkDeleteModal(false)
  }

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
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
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/patients/new"
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
          {/* Search */}
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

          {/* Filter Toggle */}
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

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
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
          </motion.div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPatients.length > 0 && (
        <motion.div
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
        </motion.div>
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
            <Link href="/dashboard/patients/new" className="btn-primary">
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
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(patient.id)}
                          onChange={() => handleSelectPatient(patient.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                            <div className="text-sm text-gray-500">
                              ID: {patient.patient_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.email}</div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
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
                            href={`/dashboard/patients/${patient.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/dashboard/patients/${patient.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Patient"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(patient)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Patient"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {patients.map((patient, index) => (
                <motion.div
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
                        href={`/dashboard/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/patients/${patient.id}/edit`}
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
                </motion.div>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Patient
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-900">
                    {deleteModal.patient?.full_name}
                  </span>
                  ? This action cannot be undone and will permanently remove all patient data including:
                </p>
                <ul className="text-sm text-gray-500 mt-2 text-left list-disc list-inside">
                  <li>Personal information</li>
                  <li>Medical history</li>
                  <li>Appointment records</li>
                  <li>AI diagnoses</li>
                  <li>Medical records</li>
                </ul>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Deleting...</span>
                      </>
                    ) : (
                      'Delete Patient'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Multiple Patients
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-900">
                    {selectedPatients.length} patient(s)
                  </span>
                  ? This action cannot be undone and will permanently remove all data for these patients including:
                </p>
                <ul className="text-sm text-gray-500 mt-2 text-left list-disc list-inside">
                  <li>Personal information</li>
                  <li>Medical history</li>
                  <li>Appointment records</li>
                  <li>AI diagnoses</li>
                  <li>Medical records</li>
                </ul>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleBulkDeleteCancel}
                    disabled={bulkDeleting}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDeleteConfirm}
                    disabled={bulkDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
                  >
                    {bulkDeleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Deleting...</span>
                      </>
                    ) : (
                      `Delete ${selectedPatients.length} Patient(s)`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}