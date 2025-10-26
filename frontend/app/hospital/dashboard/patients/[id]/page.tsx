'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
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
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string
  medical_history: string
  insurance_number: string
  created_at: string
}

export default function PatientDetailsPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const patientId = params.id

  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hospital_access_token')
      
      if (!token) {
        router.push('/hospital/login')
        return
      }

      const response = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      } else {
        toast.error('Failed to load patient details')
        router.push('/hospital/dashboard/patients')
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
      toast.error('Failed to load patient details')
      router.push('/hospital/dashboard/patients')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!patient) return

    try {
      setDeleting(true)
      const token = localStorage.getItem('hospital_access_token')
      
      const response = await fetch(`http://localhost:5000/api/patients/${patient.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Patient deleted successfully')
        router.push('/hospital/dashboard/patients')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete patient')
      }
    } catch (error: any) {
      console.error('Error deleting patient:', error)
      toast.error('Failed to delete patient')
    } finally {
      setDeleting(false)
      setDeleteModal(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient not found</h3>
        <Link href="/hospital/dashboard/patients" className="btn-primary">
          Back to Patients
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/hospital/dashboard/patients"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
              {patient.full_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Patient ID: {patient.patient_id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            href={`/hospital/dashboard/patients/${patient.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="btn-danger flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{patient.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900">{patient.age} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderColor(patient.gender)}`}>
                  {patient.gender}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PhoneIcon className="h-5 w-5 text-blue-600 mr-2" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
              </div>
              {patient.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                </div>
              )}
              {patient.address && (
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{patient.address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Emergency Contact */}
          {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhoneIcon className="h-5 w-5 text-red-600 mr-2" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.emergency_contact_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Name</label>
                    <p className="text-gray-900">{patient.emergency_contact_name}</p>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                    <p className="text-gray-900">{patient.emergency_contact_phone}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Medical Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 text-red-600 mr-2" />
              Medical Info
            </h2>
            <div className="space-y-4">
              {patient.blood_group && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBloodGroupColor(patient.blood_group)}`}>
                      {patient.blood_group}
                    </span>
                  </div>
                </div>
              )}
              {patient.insurance_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Insurance</label>
                  <p className="text-gray-900 text-sm">{patient.insurance_number}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Registered</label>
                <p className="text-gray-900 text-sm">{new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/hospital/dashboard/appointments/book?patient=${patient.id}`}
                className="w-full btn-primary text-center"
              >
                Book Appointment
              </Link>
              <Link
                href={`/hospital/dashboard/patients/${patient.id}/edit`}
                className="w-full btn-secondary text-center"
              >
                Edit Patient
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Medical History & Allergies */}
      {(patient.medical_history || patient.allergies) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patient.allergies && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                Allergies
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{patient.allergies}</p>
            </motion.div>
          )}

          {patient.medical_history && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                Medical History
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{patient.medical_history}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
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
                    {patient.full_name}
                  </span>
                  ? This action cannot be undone and will permanently remove all patient data.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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
    </div>
  )
}