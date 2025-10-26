'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon, 
  BeakerIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please login to access the dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening at your hospital today.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Role: {user.role} | Email: {user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-50">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">1,247</h3>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-50">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">45</h3>
              <p className="text-sm text-gray-600">Active Doctors</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-50">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">128</h3>
              <p className="text-sm text-gray-600">Appointments Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-50">
              <BeakerIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">89</h3>
              <p className="text-sm text-gray-600">AI Diagnoses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/patients/new"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900">Add Patient</h4>
              <p className="text-sm text-blue-700">Register new patient</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/appointments"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CalendarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-900">Schedule</h4>
              <p className="text-sm text-green-700">Book appointment</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/patients"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h4 className="font-medium text-purple-900">View Patients</h4>
              <p className="text-sm text-purple-700">Manage records</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/ai-diagnosis"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <BeakerIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h4 className="font-medium text-orange-900">AI Diagnosis</h4>
              <p className="text-sm text-orange-700">Smart analysis</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-lg bg-blue-100">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New appointment scheduled with Dr. Smith</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-lg bg-purple-100">
              <BeakerIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">AI diagnosis completed for Patient #1247</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 rounded-lg bg-green-100">
              <UserGroupIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">New patient registration: John Doe</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}