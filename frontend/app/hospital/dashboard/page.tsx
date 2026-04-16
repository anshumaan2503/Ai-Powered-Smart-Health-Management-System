'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api, hospitalAPI } from '@/lib/api'
import toast from 'react-hot-toast'

import useSWR from 'swr'

interface HospitalUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  hospital_id: number
}

interface Hospital {
  id: number
  name: string
  address: string
  phone: string
  email: string
}

interface DashboardOverview {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  monthlyGrowth: {
    patients: number
    appointments: number
    revenue: number
  }
}

export default function HospitalDashboard() {
  const [user, setUser] = useState<HospitalUser | null>(null)
  const router = useRouter()

  // SWR for Profile
  const { data: hospitalResponse, error: profileError } = useSWR(
    'hospital-profile',
    async () => {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) return null
      const res = await api.get('/hospital-auth/hospital-profile')
      return res.data.hospital
    },
    { 
      revalidateOnFocus: true,
      dedupingInterval: 0 
    }
  )

  // SWR for Stats
  const { data: analyticsResponse } = useSWR(
    hospitalResponse ? 'dashboard-analytics' : null,
    () => hospitalAPI.getAnalyticsOverview('30d').then(res => res.data.overview),
    { 
      revalidateOnFocus: true, 
      dedupingInterval: 0 
    }
  )

  useEffect(() => {
    const userData = localStorage.getItem('hospital_user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/hospital/login')
    }
  }, [])

  useEffect(() => {
    if (profileError?.response?.status === 401) {
      router.push('/hospital/login')
    }
  }, [profileError])

  const hospital = hospitalResponse
  const stats: DashboardOverview | null = analyticsResponse || null
  const isLoading = !hospital && !profileError

  const handleLogout = () => {
    localStorage.removeItem('hospital_access_token')
    localStorage.removeItem('hospital_refresh_token')
    localStorage.removeItem('hospital_user')
    localStorage.removeItem('hospital_data')
    localStorage.removeItem('hospital_subscription')
    toast.success('Logged out successfully')
    router.push('/hospital/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400 ml-3">Loading dashboard...</p>
      </div>
    )
  }

  if (!user || !hospital) {
    return null // Layout will handle redirect
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 mr-3" />
            {hospital.name}
          </h1>
          <p className="text-green-100 text-lg opacity-90">
            Welcome back, {user.first_name}! Here's what's happening today.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-green-50 px-4 py-2 bg-black/10 rounded-lg backdrop-blur-sm inline-block">
            <span>📍 {hospital.address}</span>
            <span className="hidden md:inline">|</span>
            <span>📞 {hospital.phone}</span>
          </div>
        </div>
        {/* Decorative background icon */}
        <BuildingOfficeIcon className="absolute right-[-20px] top-[-20px] h-64 w-64 text-white opacity-10 pointer-events-none rotate-12" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats ? stats.totalPatients.toLocaleString() : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
              <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Doctors</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats ? stats.totalDoctors.toLocaleString() : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Appts</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats ? stats.totalAppointments.toLocaleString() : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30">
              <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats ? `₹${(stats.totalRevenue / 100000).toFixed(2)}L` : '...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/hospital/dashboard/patients"
            prefetch={true}
            className="group flex flex-col p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all border border-blue-100/50 dark:border-blue-900/20"
          >
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 w-fit group-hover:scale-110 transition-transform">
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg">Manage Patients</h4>
              <p className="text-sm text-blue-700/70 dark:text-blue-400/70">View, register and manage patient health records</p>
            </div>
          </Link>

          <Link
            href="/hospital/dashboard/doctors"
            prefetch={true}
            className="group flex flex-col p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-all border border-green-100/50 dark:border-green-900/20"
          >
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 w-fit group-hover:scale-110 transition-transform">
              <UserIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-green-900 dark:text-green-300 text-lg">Manage Doctors</h4>
              <p className="text-sm text-green-700/70 dark:text-green-400/70">Add and manage doctor profiles and specialties</p>
            </div>
          </Link>

          <Link
            href="/hospital/dashboard/appointments"
            prefetch={true}
            className="group flex flex-col p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all border border-purple-100/50 dark:border-purple-900/20"
          >
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 w-fit group-hover:scale-110 transition-transform">
              <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-purple-900 dark:text-purple-300 text-lg">Appointments</h4>
              <p className="text-sm text-purple-700/70 dark:text-purple-400/70">View, schedule and monitor daily appointments</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">New patient registration</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">John Doe registered 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-4">
                <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Appointment scheduled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dr. Smith - Tomorrow 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-4">
                <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">New doctor added</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dr. Johnson joined the team</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Overview</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Capacity</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">75%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Staff Availability</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">92%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}