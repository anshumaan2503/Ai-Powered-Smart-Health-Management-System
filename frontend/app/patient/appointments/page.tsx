'use client'

import { useState, useEffect, useRef } from 'react'
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
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import useSWR, { useSWRConfig } from 'swr'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'

interface Appointment {
  id: number
  appointment_id: string
  doctor_name: string
  hospital_name: string
  hospital_address?: string
  doctor_specialization: string
  appointment_date: string
  appointment_type: string
  status: 'requested' | 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'awaiting_payment'
  consultation_fee: number
  hospital_id: number
  report_url?: string
  report_name?: string
}

export default function PatientAppointmentsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { mutate: globalMutate } = useSWRConfig()
  const [isPageVisible, setIsPageVisible] = useState(true)

  // Fetch Appointments with SWR
  const { data: appointmentsResponse, error: fetchError, mutate, isValidating } = useSWR(
    user ? 'patient-appointments' : null,
    async () => {
      const response = await api.get('/appointments/')
      return response.data.appointments as Appointment[]
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 15000, // Refresh every 15 seconds
      dedupingInterval: 2000,
    }
  )

  const appointments = appointmentsResponse || []
  const loading = !appointmentsResponse && !fetchError
  const refreshing = isValidating && appointments.length > 0

  // Handle visibility changes for SWR
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const handleManualRefresh = async () => {
    await mutate()
    toast.success('Appointments updated!', { duration: 2, icon: '🔄' })
  }

  const formatLastUpdated = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    if (appointment.status === 'awaiting_payment') {
      toast.error('Please complete payment to download appointment slip')
      return
    }
    
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
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    // Optimistic Update
    mutate(
      (prev: any) => {
        if (!prev) return prev
        return prev.map((a: Appointment) =>
          a.id === appointmentId ? { ...a, status: 'cancelled' } : a
        )
      },
      false
    )

    try {
      await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' })
      toast.success('Appointment cancelled successfully!')
      mutate() // Revalidate
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
      mutate() // Rollback
    }
  }

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this pending request?')) return

    // Optimistic Update
    mutate(
      (prev: any) => {
        if (!prev) return prev
        return prev.filter((a: Appointment) => a.id !== appointmentId)
      },
      false
    )

    try {
      await api.delete(`/appointments/${appointmentId}`)
      toast.success('Appointment deleted successfully!')
      mutate() // Revalidate
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Failed to delete appointment')
      mutate() // Rollback
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
      case 'awaiting_payment':
        return <ClockIcon className="h-5 w-5 text-orange-500" />
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
      case 'awaiting_payment':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
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
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                  MediCare Pro Appointments
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <Link
                  href="/patient/dashboard"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors flex items-center"
                >
                  Dashboard
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                    {user.first_name?.[0]}
                  </div>
                  <span className="hidden sm:inline font-medium">Hi, {user.first_name}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero Section */}
          <div className="relative mb-12">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Appointments History
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Track your health journey, view medical reports, and manage your upcoming consultations all in one place.
              </p>
            </m.div>
            <div className="absolute top-0 right-0 -z-0 opacity-10 dark:opacity-20 pointer-events-none">
              <CalendarIcon className="h-48 w-48 text-indigo-600" />
            </div>
          </div>

          {/* Smart Toolbar */}
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 mb-10 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
              <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                <Link
                  href="/patient/dashboard"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  New Booking
                </Link>
                <button
                  onClick={handleDownloadHistory}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold border-2 border-slate-100 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Export PDF
                </button>
              </div>
              
              <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatLastUpdated()}</p>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      refreshing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 animate-pulse'
                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-900/40 uppercase tracking-wider">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
                  Real-time Enabled
                </div>
              </div>
            </div>
          </m.div>

          {/* List Section */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 animate-pulse">
                      <div className="flex gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <m.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 h-24 w-24 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                    <CalendarIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No Appointments Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    Take the first step towards better health by booking a consultation with our expert doctors.
                  </p>
                  <Link
                    href="/patient/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                  >
                    Start Your Search
                  </Link>
                </m.div>
              ) : (
                appointments.map((appointment, index) => (
                  <m.div
                    key={appointment.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x dark:divide-slate-700">
                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                              <UserIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {appointment.doctor_name}
                              </h3>
                              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{appointment.doctor_specialization}</p>
                            </div>
                          </div>
                          <m.span 
                            layout
                            className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-widest flex items-center gap-2 ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </m.span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors hover:border-indigo-200">
                            <MapPinIcon className="h-5 w-5 text-indigo-500" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Hospital</p>
                                <p className="text-sm font-semibold truncate">{appointment.hospital_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors hover:border-indigo-200">
                            <CalendarIcon className="h-5 w-5 text-indigo-500" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                                <p className="text-sm font-semibold">{new Date(appointment.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors hover:border-indigo-200">
                            <ClockIcon className="h-5 w-5 text-indigo-500" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                                <p className="text-sm font-semibold">{new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                             <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                ₹
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase">Fee Paid</p>
                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">₹{appointment.consultation_fee}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/20 md:w-64 flex flex-col justify-center space-y-4">
                        {appointment.status === 'awaiting_payment' && (
                          <>
                            <button
                              onClick={async () => {
                                const { processPayment } = await import('@/lib/razorpay-service')
                                processPayment({
                                  amount: appointment.consultation_fee,
                                  paymentType: 'appointment',
                                  referenceId: appointment.id,
                                  customerInfo: {
                                    name: `${user?.first_name} ${user?.last_name}`,
                                    email: user?.email,
                                  },
                                  onSuccess: () => {
                                    toast.success('Payment successful!')
                                    mutate()
                                  },
                                  onFailure: () => {
                                    toast.error('Payment failed or cancelled.')
                                  }
                                })
                              }}
                              className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none"
                            >
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                              Delete Request
                            </button>
                          </>
                        )}

                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all hover:shadow-lg hover:shadow-rose-100"
                          >
                            Cancel Request
                          </button>
                        )}

                        {appointment.status !== 'awaiting_payment' && (
                          <button
                            onClick={() => handleDownloadAppointment(appointment)}
                            className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all hover:shadow-lg hover:shadow-indigo-100"
                          >
                            Appointment Slip
                          </button>
                        )}

                        {appointment.status === 'completed' && appointment.report_url && (
                          <>
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${appointment.report_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all text-center shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                              Medical Report
                            </a>
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${appointment.report_url}/download`}
                              download={appointment.report_name || 'medical-report.pdf'}
                              className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all text-center"
                            >
                              Download PDF
                            </a>
                          </>
                        )}
                        
                        {appointment.status === 'completed' && !appointment.report_url && (
                          <div className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-bold text-sm text-center cursor-not-allowed">
                            Report Processing
                          </div>
                        )}
                      </div>
                    </div>
                  </m.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </LazyMotion>
  )
}