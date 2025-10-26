'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  is_active: boolean
  doctor_profile?: {
    doctor_id: string
    specialization: string
    qualification: string
    experience_years: number
    consultation_fee: number
    license_number?: string
    available_days?: string
    available_hours?: string
  }
}

export default function DoctorEditPage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    doctor_profile: {
      specialization: '',
      qualification: '',
      experience_years: 0,
      consultation_fee: 0,
      available_days: '',
      available_hours: ''
    }
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [changePassword, setChangePassword] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDoctor()
    }
  }, [params.id])

  const fetchDoctor = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const response = await fetch(`http://localhost:5000/api/hospital/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch doctor')
      }

      const data = await response.json()
      const foundDoctor = data.staff.find((s: Doctor) => s.id === parseInt(params.id as string))
      
      if (!foundDoctor) {
        setError('Doctor not found')
        return
      }

      setDoctor(foundDoctor)
      setFormData({
        first_name: foundDoctor.first_name,
        last_name: foundDoctor.last_name,
        email: foundDoctor.email,
        phone: foundDoctor.phone || '',
        password: '',
        doctor_profile: {
          specialization: foundDoctor.doctor_profile?.specialization || '',
          qualification: foundDoctor.doctor_profile?.qualification || '',
          experience_years: foundDoctor.doctor_profile?.experience_years || 0,
          consultation_fee: foundDoctor.doctor_profile?.consultation_fee || 0,
          available_days: foundDoctor.doctor_profile?.available_days || '',
          available_hours: foundDoctor.doctor_profile?.available_hours || ''
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('doctor_profile.')) {
      const profileField = name.replace('doctor_profile.', '')
      setFormData(prev => ({
        ...prev,
        doctor_profile: {
          ...prev.doctor_profile,
          [profileField]: profileField.includes('years') || profileField.includes('fee') 
            ? parseInt(value) || 0 
            : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare data - only include password if it's being changed
      const updateData = { ...formData }
      if (!changePassword || !formData.password) {
        delete updateData.password
      }

      const response = await fetch(`http://localhost:5000/api/hospital/staff/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update doctor')
      }

      setSuccess('Doctor updated successfully!')
      setTimeout(() => {
        router.push(`/hospital/dashboard/doctors/${params.id}`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch(`http://localhost:5000/api/hospital/staff/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete doctor')
      }

      router.push('/hospital/dashboard/doctors')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete doctor')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    )
  }

  if (error && !doctor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/hospital/dashboard/doctors"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Not Found</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/hospital/dashboard/doctors/${params.id}`}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Doctor</h1>
          <p className="text-gray-600">Update doctor information and profile</p>
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

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="doctor_profile.specialization"
                  value={formData.doctor_profile.specialization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification *
                </label>
                <input
                  type="text"
                  name="doctor_profile.qualification"
                  value={formData.doctor_profile.qualification}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  name="doctor_profile.experience_years"
                  value={formData.doctor_profile.experience_years}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  name="doctor_profile.consultation_fee"
                  value={formData.doctor_profile.consultation_fee}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <input
                  type="text"
                  name="doctor_profile.available_days"
                  value={formData.doctor_profile.available_days}
                  onChange={handleInputChange}
                  placeholder="e.g., Monday to Friday"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Hours
                </label>
                <input
                  type="text"
                  name="doctor_profile.available_hours"
                  value={formData.doctor_profile.available_hours}
                  onChange={handleInputChange}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Password Management</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <EyeIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Current Login Credentials</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                      {doctor?.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                    <p className="text-sm text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                      ••••••••••••
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use the form below to update these credentials
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked)
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-900">
                  Change password
                </label>
              </div>

              {changePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={changePassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any password (restrictions will be added later)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <span>Delete Doctor</span>
            </button>
            
            <div className="flex space-x-4">
              <Link
                href={`/hospital/dashboard/doctors/${params.id}`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Doctor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Dr. {doctor?.first_name} {doctor?.last_name}? 
              This action cannot be undone and will permanently remove all their data.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}