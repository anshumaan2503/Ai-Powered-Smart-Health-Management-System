'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function EditHospitalPage() {
  const [hospital, setHospital] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const hospitalId = params.id

  useEffect(() => {
    loadHospital()
  }, [hospitalId])

  const loadHospital = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospitalId}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setHospital(data.hospital)
        setFormData({
          name: data.hospital.name,
          email: data.hospital.email,
          phone: data.hospital.phone,
          address: data.hospital.address
        })
      } else {
        setError('Failed to load hospital details')
      }
    } catch (error) {
      console.error('Error loading hospital:', error)
      setError('Error loading hospital details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospitalId}/edit`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess('Hospital updated successfully!')
        
        // Update local hospital data
        setHospital(prev => ({
          ...prev,
          ...result.hospital
        }))

        // Redirect back to hospitals list after 2 seconds
        setTimeout(() => {
          router.push('/anshuman/dashboard/hospitals')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update hospital')
      }
    } catch (error) {
      console.error('Error updating hospital:', error)
      setError('Error updating hospital')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospitalId}/delete`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        setSuccess('Hospital deactivated successfully!')
        setTimeout(() => {
          router.push('/anshuman/dashboard/hospitals')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete hospital')
      }
    } catch (error) {
      console.error('Error deleting hospital:', error)
      setError('Error deleting hospital')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Hospital not found</h3>
        <p className="text-gray-600 mb-4">The hospital you're looking for doesn't exist.</p>
        <Link href="/anshuman/dashboard/hospitals" className="btn-primary">
          Back to Hospitals
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/anshuman/dashboard/hospitals"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Hospital</h1>
            <p className="text-gray-600">Update hospital information and settings</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Deactivate Hospital
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hospital Information</h2>
                <p className="text-gray-600">Update basic hospital details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4">
                <Link
                  href="/anshuman/dashboard/hospitals"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Hospital Stats Sidebar */}
        <div className="space-y-6">
          {/* Current Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Patients</span>
                <span className="text-sm font-semibold text-gray-900">{hospital.stats?.totalPatients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Doctors</span>
                <span className="text-sm font-semibold text-gray-900">{hospital.stats?.totalDoctors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Staff</span>
                <span className="text-sm font-semibold text-gray-900">{hospital.stats?.totalStaff || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-sm font-semibold text-green-600">
                  ₹{hospital.stats?.monthlyRevenue || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hospital.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                  hospital.subscription?.plan === 'standard' ? 'bg-green-100 text-green-800' :
                  hospital.subscription?.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {hospital.subscription?.plan || 'trial'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  hospital.subscription?.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {hospital.subscription?.status || 'inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Fee</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{hospital.subscription?.monthlyFee || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires</span>
                <span className="text-sm text-gray-900">
                  {hospital.subscription?.expiryDate ? 
                    new Date(hospital.subscription.expiryDate).toLocaleDateString() : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            
            <Link
              href={`/anshuman/dashboard/subscriptions?hospital=${hospital.id}`}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deactivate Hospital</h3>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to deactivate <strong>{hospital.name}</strong>? 
              This will disable all subscriptions and mark the hospital as inactive.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deactivating...
                  </>
                ) : (
                  'Deactivate Hospital'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}