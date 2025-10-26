'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Role {
  value: string
  label: string
  description: string
}

export default function AddStaffPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Hardcoded roles for faster loading (excluding doctor - they have separate management)
  const roles: Role[] = [
    {
      value: 'nurse',
      label: 'Nurse',
      description: 'Nursing staff with patient care responsibilities'
    },
    {
      value: 'receptionist',
      label: 'Receptionist',
      description: 'Front desk staff for appointments and inquiries'
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Full system access and management rights'
    }
  ]

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch('http://localhost:5000/api/hospital/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      console.log('Response status:', response.status)
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API Error:', data)
        throw new Error(data.error || 'Failed to add staff member')
      }

      setSuccess('Staff member added successfully!')
      setTimeout(() => {
        router.push('/hospital/dashboard/staff')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add staff member')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Add Staff Member</h1>
          <p className="text-gray-600">Add nurses, receptionists, and administrative staff</p>
          <p className="text-sm text-blue-600 mt-1">
            👨‍⚕️ To add doctors, use the <Link href="/hospital/dashboard/doctors/add" className="underline">Add Doctor</Link> section
          </p>
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
                  Role *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., nurse, receptionist, admin, technician"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the staff member's role (nurse, receptionist, admin, etc.)
                </p>
              </div>

              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-900">Auto-Generated Credentials</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Email and password will be automatically generated based on the staff member's name and hospital domain. 
                  You can set and view the login credentials by editing the staff member's profile after registration.
                </p>
              </div>
            </div>
          </div>



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
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}