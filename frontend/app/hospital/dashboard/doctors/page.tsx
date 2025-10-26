'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  is_active: boolean
  doctor_profile?: {
    specialization: string
    qualification: string
    experience_years: number
    consultation_fee: number
    license_number?: string
    rating?: number
    total_patients?: number
  }
}

export default function DoctorsManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const response = await fetch('http://localhost:5000/api/hospital/staff?role=doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }

      const data = await response.json()
      setDoctors(data.staff || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const toggleDoctorStatus = async (doctorId: number) => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      const response = await fetch(`http://localhost:5000/api/hospital/staff/${doctorId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to update doctor status')
      }

      fetchDoctors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update doctor status')
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' || 
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctor_profile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialization = specializationFilter === '' ||
      doctor.doctor_profile?.specialization?.toLowerCase().includes(specializationFilter.toLowerCase())
    
    return matchesSearch && matchesSpecialization
  })

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Medical Team</h1>
            <p className="text-blue-100 text-lg">Manage your hospital's doctors and medical professionals</p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                👨‍⚕️ {doctors.length} Doctors
              </span>
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                ⭐ {doctors.length > 0 ? (doctors.reduce((acc, d) => acc + (d.doctor_profile?.rating || 0), 0) / doctors.length).toFixed(1) : '0.0'} Avg Rating
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/hospital/dashboard/doctors/import"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 font-semibold shadow-lg"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Import Doctors</span>
            </Link>
            <Link
              href="/hospital/dashboard/doctors/add"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 flex items-center space-x-2 font-semibold shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Doctor</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctors by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter by specialization"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first doctor to the medical team.</p>
          <Link
            href="/hospital/dashboard/doctors/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Doctor</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Doctor Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-200 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {doctor.doctor_profile?.specialization || 'General Medicine'}
                    </p>
                    <div className="mt-1">
                      {renderStars(doctor.doctor_profile?.rating || 0)}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    doctor.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    <span>{doctor.doctor_profile?.qualification || 'MBBS'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{doctor.doctor_profile?.experience_years || 0} years</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-green-600 font-medium mr-1">₹</span>
                    <span>{(doctor.doctor_profile?.consultation_fee || 0).toLocaleString('en-IN')} INR</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>{doctor.doctor_profile?.total_patients || 0} patients</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/hospital/dashboard/doctors/${doctor.id}`}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center space-x-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                  <Link
                    href={`/hospital/dashboard/doctors/${doctor.id}/edit`}
                    className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center space-x-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => toggleDoctorStatus(doctor.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      doctor.is_active
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}