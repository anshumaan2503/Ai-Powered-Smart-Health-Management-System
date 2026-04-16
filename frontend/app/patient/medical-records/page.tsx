'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    HeartIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'
import { ThemeToggleButton } from '@/components/ui/ThemeToggle'


interface Record {
    id: number
    appointment_id: string
    doctor_name: string
    hospital_name: string
    appointment_date: string
    report_url: string
    report_name: string
}

export default function MedicalRecordsPage() {
    const { user, isLoading: isAuthLoading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch Records with SWR
    const { data: recordsResponse, error, isValidating } = useSWR(
        user ? 'medical-records' : null,
        async () => {
            const response = await api.get('/appointments/')
            const allApps = response.data.appointments || []
            return allApps.filter((app: any) => app.status === 'completed' && app.report_url) as Record[]
        }
    )

    const records = recordsResponse || []
    const loading = !recordsResponse && !error
    const refreshing = isValidating && records.length > 0


    const filteredRecords = records.filter(record =>
        record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 font-medium mb-4">You need to be logged in to view medical records.</p>
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-x-hidden">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/patient/dashboard" className="flex items-center space-x-2 group">
                                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
                                    <DocumentTextIcon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                    MediCare Pro Vault
                                </span>
                            </Link>

                            <div className="flex items-center space-x-4">
                                <ThemeToggleButton />
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                                <Link 
                                    href="/patient/dashboard" 
                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                    {/* Hero Section */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            Your Medical <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-200 dark:decoration-indigo-800">Archive</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            A secure, encrypted space for all your laboratory results, diagnostic summaries, and medical history.
                        </p>
                    </m.div>

                    {/* Search & Filters */}
                    <m.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-10"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by specialty, doctor, or hospital..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="px-8 py-4 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl font-bold border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center">
                                <FunnelIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                Advanced Filters
                            </button>
                        </div>
                    </m.div>

                    {/* Records List */}
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-700 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <m.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700"
                            >
                                <div className="h-24 w-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                    <DocumentTextIcon className="h-12 w-12 text-indigo-300 dark:text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Records Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Reports will automatically appear here once your medical consultations are finalized.
                                </p>
                            </m.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredRecords.map((record, index) => (
                                    <m.div 
                                        key={record.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all hover:shadow-2xl hover:-translate-y-2"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl group-hover:scale-110 transition-transform">
                                                <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Generated</div>
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(record.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                            {record.report_name || 'Medical Summary'}
                                        </h3>
                                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2" />
                                            Dr. {record.doctor_name}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-8 truncate">
                                            <HeartIcon className="h-4 w-4 text-rose-500" />
                                            {record.hospital_name}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${record.report_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                View
                                            </a>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${record.report_url}/download`}
                                                download={record.report_name || 'medical-report.pdf'}
                                                className="flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all text-xs font-black uppercase tracking-widest"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                PDF
                                            </a>
                                        </div>
                                    </m.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </LazyMotion>
    )
}
