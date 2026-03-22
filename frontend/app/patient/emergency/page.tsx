'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ExclamationTriangleIcon,
    PhoneIcon,
    MapPinIcon,
    ClockIcon,
    HeartIcon
} from '@heroicons/react/24/outline'

export default function EmergencyPage() {
    const [location, setLocation] = useState('Current Location')

    const emergencyContacts = [
        { name: 'Emergency Ambulance', number: '102', icon: PhoneIcon, color: 'text-red-600 bg-red-100' },
        { name: 'Police Helpline', number: '100', icon: ShieldCheckIcon, color: 'text-blue-600 bg-blue-100' },
        { name: 'Women Helpline', number: '1091', icon: HeartIcon, color: 'text-pink-600 bg-pink-100' },
        { name: 'Fire Station', number: '101', icon: FireIcon, color: 'text-orange-600 bg-orange-100' },
    ]

    return (
        <div className="min-h-screen bg-red-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200">
                    <div className="bg-red-600 p-8 text-white text-center">
                        <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                        <h1 className="text-3xl font-black mb-2">EMERGENCY ASSISTANCE</h1>
                        <p className="text-red-100">Quick access to life-saving services near you.</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {emergencyContacts.map((contact, index) => (
                                <a
                                    key={index}
                                    href={`tel:${contact.number}`}
                                    className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200 group"
                                >
                                    <div className={`p-4 rounded-xl ${contact.color} mr-4 group-hover:scale-110 transition-transform`}>
                                        <contact.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{contact.name}</p>
                                        <p className="text-2xl font-black text-gray-900">{contact.number}</p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                                <MapPinIcon className="h-6 w-6 mr-2" />
                                Nearest Trauma Centers
                            </h2>
                            <div className="space-y-4">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                        <div>
                                            <h3 className="font-bold text-gray-900">City General Hospital</h3>
                                            <p className="text-sm text-gray-500">2.4 km away • Open 24/7</p>
                                        </div>
                                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">
                                            Navigate
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/patient/dashboard" className="text-gray-500 hover:text-gray-700 font-medium">
                        ← Back to Safety Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

function ShieldCheckIcon(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    )
}

function FireIcon(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 3.335 7 3.335 7 1 0 1.665-2 1.665-2 1.5 1.666 3 5.334 3 8.667a8.001 8.001 0 01-1.665 4.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}
