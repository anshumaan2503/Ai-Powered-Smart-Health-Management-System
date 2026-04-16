'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlusIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BanknotesIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { hospitalAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AddDoctorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'doctor',
    specialization: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    license_number: '',
    password: '123' // Default password
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    try {
      // Convert numeric fields
      const submitData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        consultation_fee: parseFloat(formData.consultation_fee) || 0.0
      }

      const response = await hospitalAPI.createStaff(submitData)
      
      if (response.data.error) {
        throw new Error(response.data.error)
      }

      toast.success('Doctor added successfully!')
      router.push('/hospital/dashboard/doctors')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to add doctor')
      toast.error(err.response?.data?.error || 'Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/hospital/dashboard/doctors"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Specialist</h1>
          <p className="text-gray-600">Enter doctor details to add them to your medical team</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserPlusIcon className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="john.doe@example.com"
              />
              <p className="mt-1 text-xs text-gray-500 italic">If left blank, email will be auto-generated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>

        {/* Professional Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
              Professional Profile
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Specialization *
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Specialization</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Oncology">Oncology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Gastroenterology">Gastroenterology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. MBBS, MD (Cardiology)"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Years of Experience
              </label>
              <div className="relative">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Consultation Fee (INR)
              </label>
              <div className="relative">
                <BanknotesIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="500"
                  min="0"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                License Number (Optional)
              </label>
              <div className="relative">
                <IdentificationIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. REG-12345"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 italic">If left blank, a unique license number will be auto-generated</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href="/hospital/dashboard/doctors"
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-semibold transition-all shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg shadow-blue-100 flex items-center justify-center min-w-[160px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              'Add Specialist'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
