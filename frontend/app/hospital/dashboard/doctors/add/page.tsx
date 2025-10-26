'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AddDoctorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    // Doctor specific fields
    specialization: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    license_number: ''
  })
  
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null)

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem('hospital_access_token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      setError('Please login first to access this page')
      setTimeout(() => {
        router.push('/hospital/login')
      }, 2000)
      return
    }

    // Check if user is admin
    try {
      const userData = JSON.parse(user)
      if (userData.role !== 'admin') {
        setError('Admin access required to add doctors')
        setTimeout(() => {
          router.push('/hospital/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('Invalid user data. Please login again.')
      setTimeout(() => {
        router.push('/hospital/login')
      }, 2000)
    }
  }, [router])

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
        setError('Please login first to add doctors')
        setTimeout(() => {
          router.push('/hospital/login')
        }, 2000)
        return
      }

      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.specialization || !formData.qualification) {
        setError('Please fill in all required fields')
        return
      }

      const submitData = {
        ...formData,
        role: 'doctor', // Always set role as doctor
        experience_years: Number(formData.experience_years) || 0,
        consultation_fee: Number(formData.consultation_fee) || 0
      }

      console.log('Sending data to backend:', submitData)
      
      const response = await fetch('http://localhost:5000/api/hospital/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API Error:', data)
        console.error('Response Status:', response.status)
        console.error('Submit Data:', submitData)
        
        // Handle specific error cases
        if (response.status === 422) {
          if (data.error && data.error.includes('limit')) {
            throw new Error('Staff limit reached. Please upgrade your subscription to add more doctors.')
          } else {
            throw new Error(data.error || 'Validation error: Please check all fields are filled correctly.')
          }
        }
        
        throw new Error(data.error || `Failed to add doctor (${response.status})`)
      }

      setSuccess('Doctor added successfully!')
      setTimeout(() => {
        router.push('/hospital/dashboard/doctors')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  const specializations = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
    'Gastroenterology', 'General Medicine', 'Gynecology', 'Neurology',
    'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
    'Surgery', 'Urology', 'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <Link
            href="/hospital/dashboard/doctors"
            className="p-2 rounded-lg bg-blue-500 bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Doctor</h1>
            <p className="text-blue-100 text-lg">Add a medical professional to your team</p>
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



      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Personal Information */}
          <div>
            <div className="flex items-center mb-6">
              <UserPlusIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-900">Login Credentials</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Email and password will be automatically generated. You can set and view the login credentials 
                  by editing the doctor's profile after registration.
                </p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center mb-6">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Medical Credentials</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MBBS, MD, MS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <div className="relative">
                  <ClockIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleInputChange}
                    min="0"
                    step="50"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">INR</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number
                </label>
                <div className="relative">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter medical license number (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <Link
              href="/hospital/dashboard/doctors"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Doctor...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Add Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}