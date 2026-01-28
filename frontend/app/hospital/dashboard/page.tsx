'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

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

export default function HospitalDashboard() {
  const [user, setUser] = useState<HospitalUser | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      const userData = localStorage.getItem('hospital_user')

      if (!token || !userData) {
        router.push('/hospital/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Fetch hospital profile using API client
      const response = await api.get('/hospital-auth/hospital-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response?.data?.hospital) {
        setHospital(response.data.hospital)
      } else {
        throw new Error('Failed to fetch hospital profile')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('hospital_access_token')
      localStorage.removeItem('hospital_refresh_token')
      localStorage.removeItem('hospital_user')
      router.push('/hospital/login')
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading hospital dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please login to access the hospital dashboard</p>
          <Link
            href="/hospital/login"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go to Hospital Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Hospital Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">Welcome, {user.first_name}!</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">({user.role})</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {hospital.name}
          </h1>
          <p className="text-green-100">
            Hospital Management Dashboard
          </p>
          <div className="mt-4 text-sm text-green-100">
            <p>{hospital.address}</p>
            <p>Phone: {hospital.phone} | Email: {hospital.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doctors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">28</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue (Month)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹4,56,780</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/hospital/dashboard/patients"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200">Manage Patients</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">View and manage patient records</p>
              </div>
            </Link>

            <Link
              href="/hospital/dashboard/doctors"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-200">Manage Doctors</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Add and manage doctor profiles</p>
              </div>
            </Link>

            <Link
              href="/hospital/dashboard/appointments"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-200">Appointments</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">View and schedule appointments</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New patient registration</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">John Doe registered 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Appointment scheduled</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dr. Smith - Tomorrow 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New doctor added</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dr. Johnson joined the team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}