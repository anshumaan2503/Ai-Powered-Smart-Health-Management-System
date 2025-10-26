'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface StaffMember {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  doctor_profile?: {
    specialization: string
    qualification: string
    experience_years: number
    consultation_fee: number
    license_number?: string
  }
}

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams()
  const staffId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    // Doctor specific fields
    specialization: '',
    qualification: '',
    experience_years: 0,
    consultation_fee: 0,
    license_number: ''
  })

  useEffect(() => {
    if (staffId) {
      fetchStaffMember()
    }
  }, [staffId])

  const fetchStaffMember = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      // First get all staff to find the specific member
      const response = await fetch('http://localhost:5000/api/hospital/staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }

      const data = await response.json()
      const staffMember = data.staff?.find((s: StaffMember) => s.id === parseInt(staffId))

      if (!staffMember) {
        throw new Error('Staff member not found')
      }

      setStaff(staffMember)
      setFormData({
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        phone: staffMember.phone || '',
        specialization: staffMember.doctor_profile?.specialization || '',
        qualification: staffMember.doctor_profile?.qualification || '',
        experience_years: staffMember.doctor_profile?.experience_years || 0,
        consultation_fee: staffMember.doctor_profile?.consultation_fee || 0,
        license_number: staffMember.doctor_profile?.license_number || ''
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff member')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'consultation_fee' ? Number(value) : value
    }))
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

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      }

      // Add doctor profile data if staff is a doctor
      if (staff?.role === 'doctor') {
        updateData.doctor_profile = {
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience_years: formData.experience_years,
          consultation_fee: formData.consultation_fee,
          license_number: formData.license_number
        }
      }

      const response = await fetch(`http://localhost:5000/api/hospital/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update staff member')
      }

      setSuccess('Staff member updated successfully!')
      setTimeout(() => {
        router.push('/hospital/dashboard/staff')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update staff member')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading staff member...</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Staff member not found</h3>
        <Link
          href="/hospital/dashboard/staff"
          className="text-blue-600 hover:text-blue-500"
        >
          Back to staff list
        </Link>
      </div>
    )
  }

  const isDoctorRole = staff.role === 'doctor'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/hospital/dashboard/staff"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {staff.first_name} {staff.last_name}
          </h1>
          <p className="text-gray-600">Update staff member information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Staff Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {staff.first_name} {staff.last_name}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                staff.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                staff.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                staff.role === 'nurse' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                staff.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {staff.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
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
                  Email
                </label>
                <input
                  type="email"
                  value={staff.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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
            </div>
          </div>

          {/* Doctor Specific Fields */}
          {isDoctorRole && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiology, Pediatrics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="e.g., MBBS, MD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee
                  </label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="Medical license number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/hospital/dashboard/staff"
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
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}