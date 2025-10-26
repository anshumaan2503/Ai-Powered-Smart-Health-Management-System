'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DoctorDashboardPage() {
  const [doctorData, setDoctorData] = useState<any>(null)
  const [stats, setStats] = useState({
    todayAppointments: 8,
    totalPatients: 156,
    pendingReports: 3,
    monthlyEarnings: 85000 // INR amount
  })

  // Format currency in Indian format
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    // Load doctor data from localStorage
    const user = localStorage.getItem('user')
    if (user) {
      setDoctorData(JSON.parse(user))
    }
  }, [])

  if (!doctorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', time: '10:00 AM', type: 'Consultation' },
    { id: 2, patient: 'Sarah Johnson', time: '11:30 AM', type: 'Follow-up' },
    { id: 3, patient: 'Mike Wilson', time: '2:00 PM', type: 'Check-up' },
    { id: 4, patient: 'Emily Davis', time: '3:30 PM', type: 'Consultation' }
  ]

  const recentPatients = [
    { id: 1, name: 'Alice Brown', lastVisit: '2 days ago', status: 'Stable' },
    { id: 2, name: 'Robert Taylor', lastVisit: '1 week ago', status: 'Follow-up needed' },
    { id: 3, name: 'Lisa Anderson', lastVisit: '3 days ago', status: 'Recovered' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Dr. {doctorData.first_name} {doctorData.last_name}
            </h1>
            <p className="text-blue-100 text-lg">
              Your medical dashboard - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                👨‍⚕️ Cardiology Specialist
              </span>
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                📅 {stats.todayAppointments} appointments today
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <ClockIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Current Time</p>
              <p className="text-xl font-semibold">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-50">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-50">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatients}</h3>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-50">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingReports}</h3>
              <p className="text-sm text-gray-600">Pending Reports</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-50">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{formatINR(stats.monthlyEarnings)}</h3>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
            <CalendarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 font-medium">
            View All Appointments
          </button>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
            <UserGroupIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.status === 'Stable' ? 'bg-green-100 text-green-800' :
                    patient.status === 'Recovered' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 font-medium">
            View All Patients
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-blue-900">Schedule Appointment</h3>
              <p className="text-sm text-blue-700">Book new patient visit</p>
            </div>
          </button>

          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <UserIcon className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-green-900">Add Patient</h3>
              <p className="text-sm text-green-700">Register new patient</p>
            </div>
          </button>

          <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-purple-900">Medical Records</h3>
              <p className="text-sm text-purple-700">View patient history</p>
            </div>
          </button>

          <button className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <BellIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-yellow-900">Notifications</h3>
              <p className="text-sm text-yellow-700">Check alerts & reminders</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}