'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { hospitalAPI } from '@/lib/api'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

// ⚡ Direct Path Icons: High Impact Module Reduction
import UserIcon from '@heroicons/react/24/outline/UserIcon'
import PlusIcon from '@heroicons/react/24/outline/PlusIcon'
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon'
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon'
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon'
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon'
import StarIcon from '@heroicons/react/24/outline/StarIcon'
import ClockIcon from '@heroicons/react/24/outline/ClockIcon'
import PencilIcon from '@heroicons/react/24/outline/PencilIcon'
import EyeIcon from '@heroicons/react/24/outline/EyeIcon'
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Doctor {
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
    rating?: number
    total_patients?: number
  }
}

const DoctorCard = memo(({ doctor, onToggle, renderStars }: { doctor: any, onToggle: (id: number) => void, renderStars: (r: number) => JSX.Element }) => (
  <m.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
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
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.is_active
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
          onClick={() => onToggle(doctor.id)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${doctor.is_active
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
        >
          {doctor.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  </m.div>
))

DoctorCard.displayName = 'DoctorCard'

export default function DoctorsManagementPage() {
  const { mutate: globalMutate } = useSWRConfig()
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [error, setError] = useState('')
  const [clearingAll, setClearingAll] = useState(false)

  const { data: doctorsResponse, error: fetchError, mutate } = useSWR(
    ['hospital-doctors', specializationFilter],
    () => hospitalAPI.getStaff({ role: 'doctor', per_page: 12 }),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      revalidateOnReconnect: true
    }
  )

  const doctors = doctorsResponse?.data?.staff || []
  const loading = !doctorsResponse && !fetchError
  const errorValue = fetchError?.response?.status === 401 
    ? 'Authentication required. Please login again.' 
    : (fetchError?.response?.data?.error || fetchError?.message || '')

  useEffect(() => {
    if (errorValue) setError(errorValue)
  }, [errorValue])

  const toggleDoctorStatus = useCallback(async (doctorId: number) => {
    try {
      const updatedDoctors = doctors.map((d: Doctor) => 
        d.id === doctorId ? { ...d, is_active: !d.is_active } : d
      )
      mutate({ data: { staff: updatedDoctors } } as any, false)
      await hospitalAPI.toggleStaffStatus(doctorId)
      mutate()
      globalMutate('dashboard-analytics')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status')
      mutate()
    }
  }, [doctors, mutate, globalMutate])

  const handleClearAllDoctors = async () => {
    if (!doctors.length) return
    if (!confirm('Permanently delete ALL doctors?')) return
    try {
      setClearingAll(true)
      await hospitalAPI.deleteAllDoctors()
      toast.success('Medical directory cleared')
      mutate()
    } catch (err: any) {
      toast.error('Failed to clear directory')
    } finally {
      setClearingAll(false)
    }
  }

  const filteredDoctors = useMemo(() => doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' ||
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }), [doctors, searchTerm])

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

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <UserIcon className="h-8 w-8 mr-3" />
                Medical Team
              </h1>
              <p className="mt-2 text-blue-100">Manage and coordinate hospital specialists</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/hospital/dashboard/doctors/import" className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Import CSV
              </Link>
              <Link href="/hospital/dashboard/doctors/new" className="btn-primary bg-white text-blue-600 hover:bg-blue-50 border-none">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Specialist
              </Link>
              <button 
                onClick={handleClearAllDoctors} 
                disabled={clearingAll}
                className="btn-danger bg-red-500/20 border-red-500/30 hover:bg-red-500/40"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                {clearingAll ? 'Clearing...' : 'Wipe Directory'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by name, email or specialization..."
                className="flex-1 outline-none text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="">All Specializations</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading/Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No doctors found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            <Link href="/hospital/dashboard/doctors/new" className="text-blue-600 hover:text-blue-700 font-semibold mt-4 inline-block">
              + Add first specialist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {filteredDoctors.map((doctor) => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onToggle={toggleDoctorStatus}
                renderStars={renderStars}
              />
            ))}
          </div>
        )}
      </div>
    </LazyMotion>
  )
}