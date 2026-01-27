'use client'

import { useState, useEffect } from 'react'
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
    MagnifyingGlassIcon,
    SparklesIcon,
    DocumentTextIcon,
    BellIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { ThemeToggleButton } from '@/components/ui/ThemeToggle'

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

export default function PatientDashboard() {
    const [user, setUser] = useState<any>(null)
    const [isAuthChecking, setIsAuthChecking] = useState(true)
    const [hospitals, setHospitals] = useState<Hospital[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('')

    useEffect(() => {
        checkAuth()
        fetchHospitals()
    }, [])

    const checkAuth = async () => {
        // Check for token
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        if (!token) {
            setIsAuthChecking(false)
            return
        }

        // Validate token by fetching profile
        try {
            const response = await api.get('/auth/profile')
            if (response.data.user) {
                setUser(response.data.user)
                // Update stored user data
                const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage
                storage.setItem('user', JSON.stringify(response.data.user))
            }
        } catch (error: any) {
            // Token is invalid, clear it
            console.error('Auth check failed:', error)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            sessionStorage.removeItem('access_token')
            sessionStorage.removeItem('refresh_token')
            sessionStorage.removeItem('user')
            setUser(null)
        } finally {
            setIsAuthChecking(false)
        }
    }

    const fetchHospitals = async () => {
        try {
            const response = await api.get('/hospital-auth/hospitals')
            setHospitals(response.data.hospitals || [])
        } catch (error) {
            console.error('Error fetching hospitals:', error)
            toast.error('Failed to load hospitals')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSpecialization = !selectedSpecialization ||
            hospital.specializations.includes(selectedSpecialization)
        return matchesSearch && matchesSpecialization && hospital.is_active
    })

    const uniqueSpecializations = Array.from(new Set(hospitals.flatMap(h => h.specializations))).filter(Boolean)

    if (isAuthChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <HeartIcon className="h-16 w-16 text-blue-600 dark:text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Required</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Please login to access your dashboard</p>
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    const getCurrentGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg sticky top-0 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center group">
                            <HeartIcon className="h-8 w-8 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                MediCare Pro
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:inline">Hi, {user.first_name}!</span>
                            <Link href="/patient/profile" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition">
                                Profile
                            </Link>
                            <ThemeToggleButton />
                            <button
                                onClick={() => {
                                    localStorage.removeItem('access_token')
                                    localStorage.removeItem('refresh_token')
                                    window.location.href = '/login'
                                }}
                                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Hero */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 mb-8 shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/3 -translate-x-1/3"></div>
                    </div>
                    <div className="relative">
                        <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
                            {getCurrentGreeting()}, {user.first_name}! 👋
                        </h1>
                        <p className="text-xl text-white/90 mb-6">
                            Your health journey starts here. Explore top hospitals and book your next appointment.
                        </p>
                        <div className="flex items-center space-x-2 text-white/80">
                            <ClockIcon className="h-5 w-5" />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Appointments</p>
                                <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">0</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <CalendarIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Records</p>
                                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400 bg-clip-text text-transparent">0</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                <DocumentTextIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Prescriptions</p>
                                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">0</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <HeartIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Alerts</p>
                                <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">0</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <BellIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Link href="/ai/chatbot" className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <SparklesIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-lg mb-1">AI Health Assistant</h3>
                            <p className="text-white/80 text-sm">Chat with AI for instant guidance</p>
                        </div>
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
                    </Link>

                    <Link href="/patient/appointments" className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <CalendarIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-lg mb-1">Appointments</h3>
                            <p className="text-white/80 text-sm">View & manage appointments</p>
                        </div>
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
                    </Link>

                    <Link href="/patient/medical-records" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <DocumentTextIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-lg mb-1">Medical Records</h3>
                            <p className="text-white/80 text-sm">Access your health records</p>
                        </div>
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
                    </Link>

                    <Link href="/patient/emergency" className="group relative overflow-hidden bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        <div className="relative z-10">
                            <ClockIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-lg mb-1">Emergency</h3>
                            <p className="text-white/80 text-sm">Find nearest emergency care</p>
                        </div>
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
                    </Link>
                </div>

                {/* Search Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-white/50 dark:border-gray-700/50">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Find Healthcare Providers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search hospitals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                            />
                        </div>
                        <select
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                        >
                            <option value="">All Specializations</option>
                            {uniqueSpecializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedSpecialization('') }}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-xl transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Hospitals Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Hospitals</h2>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-gray-700/50">
                            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No hospitals found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHospitals.map((hospital) => (
                                <div key={hospital.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-white/50 dark:border-gray-700/50">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{hospital.name}</h3>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span>{hospital.rating || 4.5}/5</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <UserGroupIcon className="h-4 w-4 mr-1" />
                                            <span>{hospital.total_doctors || 0}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{hospital.city}, {hospital.state}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span>{hospital.phone}</span>
                                        </div>
                                    </div>

                                    {hospital.specializations?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1">
                                                {hospital.specializations.slice(0, 2).map((spec, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {hospital.specializations.length > 2 && (
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                                                        +{hospital.specializations.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href={`/patient/hospitals/${hospital.id}`}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition text-center shadow-lg shadow-blue-500/20"
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            href={`/patient/hospitals/${hospital.id}/book-appointment`}
                                            className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium py-2 px-4 rounded-xl transition text-center"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}