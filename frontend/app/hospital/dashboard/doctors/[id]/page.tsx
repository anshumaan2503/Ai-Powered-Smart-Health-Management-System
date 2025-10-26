'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  PencilIcon
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
  created_at: string
  doctor_profile?: {
    doctor_id: string
    specialization: string
    qualification: string
    experience_years: number
    consultation_fee: number
    license_number?: string
    rating?: number
    total_patients?: number
    available_days?: string
    available_hours?: string
  }
}

export default function DoctorViewPage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctor')
    } finally {
      setLoading(false)
    }
  }

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
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
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

  if (error || !doctor) {
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
          <p className="text-red-800">{error || 'Doctor not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/hospital/dashboard/doctors"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Dr. {doctor.first_name} {doctor.last_name}
          </h1>
          <p className="text-gray-600">{doctor.doctor_profile?.specialization || 'General Medicine'}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/hospital/dashboard/doctors/${doctor.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <Link
            href={`/hospital/dashboard/doctors/${doctor.id}/edit`}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <span>Delete</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                <p className="text-gray-900">{doctor.doctor_profile?.doctor_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{doctor.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{doctor.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  doctor.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                <p className="text-gray-900">
                  {new Date(doctor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <p className="text-gray-900">{doctor.doctor_profile?.specialization || 'General Medicine'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{doctor.doctor_profile?.qualification || 'MBBS'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{doctor.doctor_profile?.experience_years || 0} years</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <p className="text-gray-900">{doctor.doctor_profile?.license_number || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                <p className="text-gray-900 text-lg font-semibold text-green-600">
                  ₹{(doctor.doctor_profile?.consultation_fee || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                {renderStars(doctor.doctor_profile?.rating || 0)}
              </div>
            </div>
          </div>

          {/* Availability */}
          {(doctor.doctor_profile?.available_days || doctor.doctor_profile?.available_hours) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctor.doctor_profile?.available_days && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Days</label>
                    <p className="text-gray-900">{doctor.doctor_profile.available_days}</p>
                  </div>
                )}
                {doctor.doctor_profile?.available_hours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Hours</label>
                    <p className="text-gray-900">{doctor.doctor_profile.available_hours}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-900 font-mono">••••••••••••</p>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Encrypted
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password is securely encrypted. Use the Edit page to change it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Patients</span>
                <span className="text-2xl font-bold text-blue-600">
                  {doctor.doctor_profile?.total_patients || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="text-2xl font-bold text-green-600">
                  {doctor.doctor_profile?.experience_years || 0}y
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {(doctor.doctor_profile?.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/hospital/dashboard/doctors/${doctor.id}/edit`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href={`/hospital/dashboard/doctors/${doctor.id}/edit`}
                className="w-full bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 text-center block"
              >
                Reset Password
              </Link>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                View Schedule
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                View Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}