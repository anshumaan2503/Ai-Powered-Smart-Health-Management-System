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
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'


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
    const { user, isLoading: isAuthLoading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialization, setSelectedSpecialization] = useState('')

    // Fetch Stats with SWR
    const { data: statsResponse } = useSWR(
        user ? 'patient-stats' : null,
        async () => {
            const response = await api.get('/appointments/')
            const apps = response.data.appointments || []
            const reportCount = apps.filter((a: any) => a.report_url).length
            return {
                appointments: apps.length,
                records: reportCount,
                prescriptions: 0,
                alerts: 0
            }
        }
    )

    // Fetch Hospitals with SWR
    const { data: hospitalsResponse, isValidating: isHospitalsLoading } = useSWR(
        user ? 'hospitals-list' : null,
        async () => {
            const response = await api.get('/hospital-auth/hospitals')
            return response.data.hospitals as Hospital[]
        }
    )

    const hospitals = hospitalsResponse || []
    const stats = statsResponse || { appointments: 0, records: 0, prescriptions: 0, alerts: 0 }
    const isLoading = !hospitalsResponse

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSpecialization = !selectedSpecialization ||
            hospital.specializations.includes(selectedSpecialization)
        return matchesSearch && matchesSpecialization && hospital.is_active
    })


    const uniqueSpecializations = Array.from(new Set(hospitals.flatMap(h => h.specializations))).filter(Boolean)

    if (isAuthLoading) {
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
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-x-hidden">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
                                    <HeartIcon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                    MediCare Pro
                                </span>
                            </Link>

                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <div className="hidden md:flex items-center space-x-2 mr-4 text-slate-600 dark:text-slate-400">
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Active System</span>
                                </div>
                                
                                <ThemeToggleButton />
                                
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />
                                
                                <div className="flex items-center space-x-3 group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.first_name}</p>
                                    </div>
                                    <Link href="/patient/profile" className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 transition-all hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-slate-900">
                                        {user.first_name?.[0]}
                                    </Link>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('access_token')
                                        localStorage.removeItem('refresh_token')
                                        window.location.href = '/login'
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Logout"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                    {/* Welcome Section */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mb-12"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 opacity-20 hidden lg:block">
                            <SparklesIcon className="h-64 w-64 text-indigo-600" />
                        </div>
                        
                        <m.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-indigo-600 dark:text-indigo-400 font-bold tracking-[0.2em] uppercase text-sm mb-4"
                        >
                            {getCurrentGreeting()}
                        </m.h2>
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                            Your Personalized <br/>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Health Command Center</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
                            Access your medical history, connect with top-tier specialists, and monitor your wellness journey with AI-driven insights.
                        </p>
                    </m.div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                        {[
                            { label: 'Visits', value: stats.appointments, icon: CalendarIcon, color: 'indigo' },
                            { label: 'Reports', value: stats.records, icon: DocumentTextIcon, color: 'emerald' },
                            { label: 'Scripts', value: stats.prescriptions, icon: HeartIcon, color: 'rose' },
                            { label: 'Notifs', value: stats.alerts, icon: BellIcon, color: 'amber' }
                        ].map((stat, idx) => (
                            <m.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 group hover:border-indigo-500 transition-all cursor-default"
                            >
                                <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </m.div>
                        ))}
                    </div>

                    {/* Navigation Hotlinks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        {[
                            { title: 'AI Symptom Hub', href: '/aichatbot', icon: SparklesIcon, desc: 'Chat with medical AI', color: 'from-violet-600 to-indigo-600' },
                            { title: 'My Appointments', href: '/patient/appointments', icon: ClockIcon, desc: 'Manage your schedule', color: 'from-indigo-600 to-blue-600' },
                            { title: 'Vault Records', href: '/patient/medical-records', icon: DocumentTextIcon, desc: 'Secure health documents', color: 'from-blue-600 to-cyan-600' },
                            { title: 'Emergency Care', href: '/patient/emergency', icon: BellIcon, desc: 'Immediate assistance', color: 'from-rose-600 to-orange-600' }
                        ].map((link, idx) => (
                            <Link 
                                key={link.title} 
                                href={link.href}
                                className={`group relative p-6 rounded-3xl overflow-hidden bg-gradient-to-br ${link.color} shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all`}
                            >
                                <div className="relative z-10 text-white">
                                    <link.icon className="h-10 w-10 mb-4 group-hover:rotate-12 transition-transform" />
                                    <h3 className="font-black text-lg mb-1">{link.title}</h3>
                                    <p className="text-white/80 text-xs font-medium">{link.desc}</p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-[2] transition-transform">
                                    <link.icon className="h-20 w-20" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Hospital Explorer */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col lg:flex-row gap-8 justify-between items-end mb-12">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Hospital Discovery</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Find and book verified healthcare providers in your network.</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <div className="relative min-w-[300px]">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Name, city, or specialty..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                </div>
                                <select
                                    value={selectedSpecialization}
                                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                                    className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 dark:text-slate-300 min-w-[200px]"
                                >
                                    <option value="">Filter Specialty</option>
                                    {uniqueSpecializations.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-700 animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredHospitals.length === 0 ? (
                                <m.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-20 text-center"
                                >
                                    <MagnifyingGlassIcon className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                    <p className="text-xl font-bold text-slate-400">No matching providers found</p>
                                    <button onClick={() => {setSearchTerm(''); setSelectedSpecialization('')}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
                                </m.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredHospitals.map((hospital, index) => (
                                        <m.div
                                            key={hospital.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none relative"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                                    <HeartIcon className="h-8 w-8 text-indigo-600" />
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900">
                                                    Verified
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{hospital.name}</h3>
                                            
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="flex items-center text-amber-500">
                                                    <StarIcon className="h-4 w-4 fill-current mr-1" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{hospital.rating || 4.5}</span>
                                                </div>
                                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {hospital.total_doctors || '0'} Specialists
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    <MapPinIcon className="h-4 w-4 mr-3 text-indigo-500" />
                                                    {hospital.city}, {hospital.state}
                                                </div>
                                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    <PhoneIcon className="h-4 w-4 mr-3 text-indigo-500" />
                                                    {hospital.phone}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-10">
                                                {hospital.specializations?.slice(0, 3).map((spec, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Link
                                                    href={`/patient/hospitals/${hospital.id}`}
                                                    className="py-3 px-4 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs text-center hover:bg-indigo-600 hover:text-white transition-all"
                                                >
                                                    View Details
                                                </Link>
                                                <Link
                                                    href={`/patient/hospitals/${hospital.id}/book-appointment`}
                                                    className="py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs text-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                                                >
                                                    Book Now
                                                </Link>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </LazyMotion>
    )
}