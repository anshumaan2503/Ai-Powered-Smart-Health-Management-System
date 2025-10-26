'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
    HeartIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    UserGroupIcon,
    CalendarIcon,
    StarIcon,
    MagnifyingGlassIcon
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
    total_doctors: number
    rating: number
    is_active: boolean
}

interface Doctor {
    id: number
    name: string
    specialization: string
    experience_years: number
    qualification: string
    hospital_name: string
    available_slots: string[]
}

export default function PatientDashboard() {
    const { user, isLoading: authLoading } = useAuth()
    const [hospitals, setHospitals] = useState<Hospital[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('')
    const [selectedCity, setSelectedCity] = useState('')

    useEffect(() => {
        fetchHospitals()
        fetchDoctors()
    }, [])

    const fetchHospitals = async () => {
        try {
            const response = await api.get('/hospital-auth/hospitals')
            setHospitals(response.data.hospitals || [])
        } catch (error) {
            console.error('Error fetching hospitals:', error)
            toast.error('Failed to load hospitals')
        }
    }

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors')
            setDoctors(response.data.doctors || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
            // Don't show error for doctors as the endpoint might not exist
        } finally {
            setIsLoading(false)
        }
    }

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCity = !selectedCity || hospital.city === selectedCity
        const matchesSpecialization = !selectedSpecialization ||
            hospital.specializations.includes(selectedSpecialization)

        return matchesSearch && matchesCity && matchesSpecialization && hospital.is_active
    })

    const uniqueCities = Array.from(new Set(hospitals.map(h => h.city))).filter(Boolean)
    const uniqueSpecializations = Array.from(new Set(hospitals.flatMap(h => h.specializations))).filter(Boolean)

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">Loading...</p>
                </div>
            </div>
        )
    }

    // Show login prompt if no user
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <HeartIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
                    <p className="text-gray-600 mb-6">Please login to access your patient dashboard</p>
                    <Link
                        href="/login"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Go to Login
                    </Link>

                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
                            <p><strong>Debug Info:</strong></p>
                            <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
                            <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
                            <p>Token: {typeof window !== 'undefined' && localStorage.getItem('access_token') ? 'Present' : 'Missing'}</p>
                        </div>
                    )}
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
                            <HeartIcon className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">MediCare Pro</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user.first_name}!</span>
                            <Link
                                href="/patient/profile"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('access_token')
                                    localStorage.removeItem('refresh_token')
                                    window.location.href = '/login'
                                }}
                                className="text-gray-600 hover:text-gray-500 font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome to Your Health Dashboard
                    </h1>
                    <p className="text-blue-100">
                        Find the best hospitals and doctors for your healthcare needs
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Healthcare Providers</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search hospitals or cities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>

                        {/* City Filter */}
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Cities</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        {/* Specialization Filter */}
                        <select
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Specializations</option>
                            {uniqueSpecializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedCity('')
                                setSelectedSpecialization('')
                            }}
                            className="btn-secondary"
                        >
                            Clear Filters
                        </button>

                        {/* Refresh Button */}
                        <button
                            onClick={() => {
                                setIsLoading(true)
                                fetchHospitals()
                                toast.success('Hospital list refreshed')
                            }}
                            className="btn-primary"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Hospitals List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Available Hospitals</h2>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="text-center py-12">
                            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No hospitals found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHospitals.map((hospital) => (
                                <div key={hospital.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border">
                                    <div className="p-6">
                                        {/* Hospital Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {hospital.name}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span>{hospital.rating || 4.5}/5</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <UserGroupIcon className="h-4 w-4 mr-1" />
                                                    <span>{hospital.total_doctors || 0} Doctors</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hospital Info */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>{hospital.phone}</span>
                                            </div>
                                        </div>

                                        {/* Specializations */}
                                        {hospital.specializations && hospital.specializations.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {hospital.specializations.slice(0, 3).map((spec, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                    {hospital.specializations.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{hospital.specializations.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/patient/hospitals/${hospital.id}`}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
                                            >
                                                View Details
                                            </Link>
                                            <Link
                                                href={`/patient/hospitals/${hospital.id}/book-appointment`}
                                                className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
                                            >
                                                Book Appointment
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-12 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/patient/appointments"
                            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <CalendarIcon className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <h4 className="font-medium text-green-900">My Appointments</h4>
                                <p className="text-sm text-green-700">View upcoming appointments</p>
                            </div>
                        </Link>

                        <Link
                            href="/patient/medical-records"
                            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                            <HeartIcon className="h-8 w-8 text-purple-600 mr-3" />
                            <div>
                                <h4 className="font-medium text-purple-900">Medical Records</h4>
                                <p className="text-sm text-purple-700">Access your health records</p>
                            </div>
                        </Link>

                        <Link
                            href="/patient/emergency"
                            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <ClockIcon className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <h4 className="font-medium text-red-900">Emergency</h4>
                                <p className="text-sm text-red-700">Find nearest emergency care</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}