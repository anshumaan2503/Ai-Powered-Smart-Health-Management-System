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

      // Fetch hospital profile using fetch to avoid patient token interference
      const response = await fetch('http://localhost:5000/api/hospital-auth/hospital-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHospital(data.hospital)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please login to access the hospital dashboard</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Hospital Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.first_name}!</span>
              <span className="text-sm text-gray-500">({user.role})</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-500 font-medium"
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue (Month)</p>
                <p className="text-2xl font-bold text-gray-900">₹4,56,780</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/hospital/patients"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Manage Patients</h4>
                <p className="text-sm text-blue-700">View and manage patient records</p>
              </div>
            </Link>

            <Link
              href="/hospital/doctors"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">Manage Doctors</h4>
                <p className="text-sm text-green-700">Add and manage doctor profiles</p>
              </div>
            </Link>

            <Link
              href="/hospital/appointments"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CalendarIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-purple-900">Appointments</h4>
                <p className="text-sm text-purple-700">View and schedule appointments</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New patient registration</p>
                <p className="text-xs text-gray-600">John Doe registered 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                <p className="text-xs text-gray-600">Dr. Smith - Tomorrow 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New doctor added</p>
                <p className="text-xs text-gray-600">Dr. Johnson joined the team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}