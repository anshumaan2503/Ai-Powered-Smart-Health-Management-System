'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Link from 'next/link'
import { 
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
  ArrowLeftIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface Hospital {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  specializations: string[]
  description: string
  established_year: number
  total_doctors: number
  total_beds: number
  rating: number
  is_active: boolean
}

interface Doctor {
  id: number
  name: string
  specialization: string
  experience_years: number
  qualification: string
  consultation_fee: number
  available_days: string[]
  available_times: string[]
  rating: number
}

export default function HospitalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSpecialization, setSelectedSpecialization] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchHospitalDetails()
      fetchHospitalDoctors()
    }
  }, [params.id])

  const fetchHospitalDetails = async () => {
    try {
      const response = await api.get(`/hospital-auth/hospitals/${params.id}`)
      setHospital(response.data.hospital)
    } catch (error) {
      console.error('Error fetching hospital details:', error)
      toast.error('Failed to load hospital details')
    }
  }

  const fetchHospitalDoctors = async () => {
    try {
      // Use the new hospital-specific doctors endpoint
      const response = await api.get(`/hospital-auth/hospitals/${params.id}/doctors`)
      setDoctors(response.data.doctors || [])
      console.log('Fetched doctors for hospital:', response.data.doctors)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      // If API fails, show empty list instead of mock data
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDoctors = selectedSpecialization 
    ? doctors.filter(doctor => doctor.specialization === selectedSpecialization)
    : doctors

  const uniqueSpecializations = Array.from(new Set(doctors.map(d => d.specialization)))

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to access this page</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Hospital not found</p>
          <Link href="/patient/dashboard" className="text-blue-600 hover:text-blue-500 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <Link href="/" className="flex items-center hover:opacity-80 transition">
                <HeartIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MediCare Pro</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.first_name}!</span>
              <Link 
                href="/patient/dashboard" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hospital Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
              <div className="flex items-center text-lg text-gray-600 mb-2">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                <span>{hospital.rating || 4.5}/5 Rating</span>
                <span className="mx-2">•</span>
                <span>{hospital.total_doctors || doctors.length} Doctors</span>
              </div>
            </div>
            <div className="text-right">
              <Link
                href={`/patient/hospitals/${hospital.id}/book-appointment`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{hospital.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{hospital.email}</span>
              </div>
            </div>

            {/* Hospital Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{hospital.total_doctors || doctors.length}</div>
                <div className="text-sm text-gray-600">Doctors</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{hospital.total_beds || 150}</div>
                <div className="text-sm text-gray-600">Beds</div>
              </div>
            </div>
          </div>

          {/* Specializations */}
          {hospital.specializations && hospital.specializations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {hospital.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {hospital.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600">{hospital.description}</p>
            </div>
          )}
        </div>

        {/* Doctors Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Doctors</h2>
            
            {/* Specialization Filter */}
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Specializations</option>
              {uniqueSpecializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No doctors found for the selected specialization</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <AcademicCapIcon className="h-4 w-4 mr-2" />
                      <span>{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{doctor.experience_years} years experience</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>{doctor.rating}/5 Rating</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Available Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.available_days.map((day, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-semibold text-gray-900">
                      Consultation Fee: ₹{doctor.consultation_fee}
                    </p>
                  </div>

                  <Link
                    href={`/patient/hospitals/${hospital.id}/doctors/${doctor.id}/book`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block"
                  >
                    Book Appointment
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}