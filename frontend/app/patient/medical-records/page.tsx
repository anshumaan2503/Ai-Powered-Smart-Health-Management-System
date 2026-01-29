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
    const [records, setRecords] = useState<Record[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchRecords()
    }, [])

    const fetchRecords = async () => {
        try {
            const response = await api.get('/appointments/')
            // Filter only completed appointments with reports
            const allApps = response.data.appointments || []
            const reportApps = allApps.filter((app: any) => app.status === 'completed' && app.report_url)
            setRecords(reportApps)
        } catch (err) {
            console.error('Error fetching records:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredRecords = records.filter(record =>
        record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center">
                            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                            Medical Records
                        </h1>
                        <p className="text-gray-600">Secure access to your laboratory and checkup reports.</p>
                    </div>
                    <Link href="/patient/dashboard" className="btn-secondary">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by doctor or hospital..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Filters
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <DocumentTextIcon className="h-10 w-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No medical records found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Once your doctor uploads a laboratory report or checkup summary, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecords.map((record) => (
                            <div key={record.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-2xl">
                                        <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(record.appointment_date).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{record.report_name || 'Medical Report'}</h3>
                                <p className="text-sm text-gray-600 mb-4 truncate">Dr. {record.doctor_name}</p>

                                <div className="flex items-center text-xs text-gray-400 mb-6">
                                    <HeartIcon className="h-4 w-4 mr-1" />
                                    {record.hospital_name}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${record.report_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        View
                                    </a>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${record.report_url}`}
                                        download
                                        className="flex items-center justify-center p-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-bold"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                        Save
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
