'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import {
  HeartIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface Appointment {
  id: number
  appointment_id: string
  doctor_name: string
  hospital_name: string
  doctor_specialization: string
  appointment_date: string
  appointment_type: string
  status: 'requested' | 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  consultation_fee: number
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/appointments/')
      setAppointments(response.data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' })
        toast.success('Appointment cancelled successfully!')
        fetchAppointments()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        toast.error('Failed to cancel appointment')
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'scheduled':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />
      case 'requested':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to view appointments</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Go to Login
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
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">My Appointments</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/patient/dashboard"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Dashboard
              </Link>
              <span className="text-gray-700">Welcome, {user.first_name}!</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past appointments</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/patient/dashboard"
              className="btn-primary text-center"
            >
              Book New Appointment
            </Link>
            <button className="btn-secondary">
              Download Appointment History
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
              <Link
                href="/patient/dashboard"
                className="btn-primary"
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.doctor_name}
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{appointment.hospital_name}</span>
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-2" />
                        <span>{appointment.doctor_specialization}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      ₹{appointment.consultation_fee}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.appointment_type}</span>
                    </div>

                    <div className="space-y-2">
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="w-full text-sm bg-red-100 text-red-700 hover:bg-red-200 py-2 px-3 rounded transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <button className="w-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 px-3 rounded transition-colors">
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}