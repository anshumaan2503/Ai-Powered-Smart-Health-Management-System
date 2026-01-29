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
  hospital_address?: string
  doctor_specialization: string
  appointment_date: string
  appointment_type: string
  status: 'requested' | 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  consultation_fee: number
  report_url?: string
  report_name?: string
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

  const handleDownloadHistory = async () => {
    if (appointments.length === 0) {
      toast.error('No appointments to download')
      return
    }

    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()

      // Add Title
      doc.setFontSize(20)
      doc.setTextColor(37, 99, 235) // Blue text
      doc.text('Appointment History', 14, 22)

      // Add Patient Info
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Patient: ${user?.first_name} ${user?.last_name}`, 14, 30)
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 36)

      // Define Table columns
      const tableColumn = ["Date", "Time", "Doctor", "Hospital", "Type", "Status", "Fee"]
      const tableRows = appointments.map(apt => [
        new Date(apt.appointment_date).toLocaleDateString(),
        new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        apt.doctor_name || 'N/A',
        apt.hospital_name || 'N/A',
        apt.appointment_type || 'N/A',
        apt.status || 'N/A',
        `Rs. ${apt.consultation_fee || 0}`
      ])

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 9 }
      })

      doc.save(`Appointment_History_${user?.first_name}.pdf`)
      toast.success('History downloaded successfully!')
    } catch (error) {
      console.error('PDF Error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const handleDownloadAppointment = async (appointment: Appointment) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Header UI
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 210, 40, 'F')

      doc.setFontSize(24)
      doc.setTextColor(255, 255, 255)
      doc.text('APPOINTMENT SLIP', 14, 28)

      // Appointment Details
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)

      const startY = 60
      const spacing = 10

      doc.setFont("helvetica", "bold")
      doc.text('APPOINTMENT ID:', 14, startY)
      doc.setFont("helvetica", "normal")
      doc.text(appointment.appointment_id || 'N/A', 60, startY)

      doc.setFont("helvetica", "bold")
      doc.text('PATIENT NAME:', 14, startY + spacing)
      doc.setFont("helvetica", "normal")
      doc.text(`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Patient', 60, startY + spacing)

      doc.setFont("helvetica", "bold")
      doc.text('HOSPITAL:', 14, startY + spacing * 2)
      doc.setFont("helvetica", "normal")
      doc.text(appointment.hospital_name || 'Not Specified', 60, startY + spacing * 2)

      doc.setFont("helvetica", "bold")
      doc.text('DOCTOR:', 14, startY + spacing * 3)
      doc.setFont("helvetica", "normal")
      doc.text(appointment.doctor_name || 'Not Specified', 60, startY + spacing * 3)

      doc.setFont("helvetica", "bold")
      doc.text('SPECIALIZATION:', 14, startY + spacing * 4)
      doc.setFont("helvetica", "normal")
      doc.text(appointment.doctor_specialization || 'General', 60, startY + spacing * 4)

      doc.setFont("helvetica", "bold")
      doc.text('DATE & TIME:', 14, startY + spacing * 5)
      doc.setFont("helvetica", "normal")
      const dt = new Date(appointment.appointment_date)
      doc.text(`${dt.toLocaleDateString()} at ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 60, startY + spacing * 5)

      doc.setFont("helvetica", "bold")
      doc.text('FEE PAID:', 14, startY + spacing * 6)
      doc.setFont("helvetica", "normal")
      doc.text(`Rs. ${appointment.consultation_fee || 0}`, 60, startY + spacing * 6)

      // Footer
      doc.setDrawColor(200)
      doc.line(14, 150, 196, 150)
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Please bring this copy during your visit.', 105, 160, { align: 'center' })
      doc.text('Generated by AI Smart Health Management System', 105, 166, { align: 'center' })

      doc.save(`Appointment_${appointment.appointment_id}.pdf`)
      toast.success('Appointment slip downloaded!')
    } catch (error) {
      console.error('PDF Error:', error)
      toast.error('Failed to generate PDF')
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
            <button
              onClick={handleDownloadHistory}
              className="btn-secondary flex items-center justify-center"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
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

                      {/* Individual Download Button */}
                      {(appointment.status === 'confirmed' || appointment.status === 'scheduled' || appointment.status === 'completed') && (
                        <button
                          onClick={() => handleDownloadAppointment(appointment)}
                          className="w-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-3 rounded transition-colors flex items-center justify-center font-medium"
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Details
                        </button>
                      )}

                      {appointment.status === 'completed' && (
                        appointment.report_url ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${appointment.report_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-sm bg-blue-600 text-white hover:bg-blue-700 py-2 px-3 rounded transition-colors shadow-sm font-medium flex items-center justify-center text-center"
                          >
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Medical Report
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full text-sm bg-gray-100 text-gray-500 py-2 px-3 rounded cursor-not-allowed font-medium text-center"
                          >
                            Report Pending
                          </button>
                        )
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