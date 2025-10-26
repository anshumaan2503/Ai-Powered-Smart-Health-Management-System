'use client'

import { useState, useEffect } from 'react'
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Appointment {
  id: number
  appointment_id: string
  appointment_date: string
  appointment_type: string
  status: string
  symptoms: string
  priority: string
  consultation_fee: number
  payment_status: string
  patient: {
    id: number
    name: string
    phone: string
    age: number
    gender: string
  }
  doctor: {
    id: number
    name: string
    specialization: string
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [dateFilter, statusFilter, doctorFilter])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const url = new URL('http://localhost:5000/api/hospital/appointments')
      if (dateFilter) url.searchParams.append('date', dateFilter)
      if (statusFilter) url.searchParams.append('status', statusFilter)
      if (doctorFilter) url.searchParams.append('doctor_id', doctorFilter)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      const response = await fetch(`http://localhost:5000/api/hospital/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update appointment')
      }

      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment')
    }
  }

  const cancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const token = localStorage.getItem('hospital_access_token')
      const response = await fetch(`http://localhost:5000/api/hospital/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
    }
  }

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('hospital_access_token')
      const response = await fetch(`http://localhost:5000/api/hospital/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete appointment')
      }

      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    }
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appointment Management</h1>
            <p className="text-indigo-100 text-lg">Schedule and manage patient appointments</p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <span className="bg-indigo-500 bg-opacity-50 px-3 py-1 rounded-full">
                📅 {appointments.length} Total Appointments
              </span>
              <span className="bg-indigo-500 bg-opacity-50 px-3 py-1 rounded-full">
                ✅ {appointments.filter(a => a.status === 'scheduled').length} Scheduled
              </span>
            </div>
          </div>
          <Link
            href="/hospital/dashboard/appointments/book"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 flex items-center space-x-2 font-semibold shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Doctors</option>
              {/* We'll populate this dynamically later */}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter('')
                setStatusFilter('')
                setDoctorFilter('')
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">Start by booking your first appointment.</p>
            <Link
              href="/hospital/dashboard/appointments/book"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Book Appointment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.appointment_date)
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.appointment_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.appointment_type}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(appointment.priority)}`}>
                              {appointment.priority}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient.age}y, {appointment.patient.gender}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {appointment.patient.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.doctor.specialization}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {date}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{appointment.consultation_fee} - {appointment.payment_status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Confirm Appointment"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <button
                              onClick={() => cancelAppointment(appointment.id)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                              title="Cancel Appointment"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Appointment Permanently"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}