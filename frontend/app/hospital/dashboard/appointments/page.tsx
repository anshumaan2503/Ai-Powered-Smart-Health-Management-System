'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

import useSWR, { useSWRConfig } from 'swr'

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
  report_url?: string
  report_name?: string
}

export default function AppointmentsPage() {
  const { mutate: globalMutate } = useSWRConfig()
  const [error, setError] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [schedulingModal, setSchedulingModal] = useState<{
    show: boolean;
    appointment: Appointment | null;
    date: string;
    time: string;
  }>({
    show: false,
    appointment: null,
    date: '',
    time: '',
  })

  const [reportModal, setReportModal] = useState<{
    show: boolean;
    appointment: Appointment | null;
    file: File | null;
    uploading: boolean;
  }>({
    show: false,
    appointment: null,
    file: null,
    uploading: false,
  })

  // Fetch Doctors for filter
  const { data: doctorsResponse } = useSWR(
    'hospital-doctors-filter',
    () => api.get('/hospital/doctors/available').then(res => res.data.doctors),
    { revalidateOnFocus: false }
  )

  const { data: appointmentsResponse, error: fetchError, mutate } = useSWR(
    ['hospital-appointments', dateFilter, statusFilter, doctorFilter, currentPage],
    () => api.get('/hospital/appointments', {
      params: {
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        doctor_id: doctorFilter || undefined,
        page: currentPage,
        per_page: 15
      }
    }),
    { 
      revalidateOnFocus: true,
      dedupingInterval: 0,
      refreshInterval: 10000, // Auto-refresh every 10 seconds when page is visible
      focus: true
    }
  )

  const appointments: Appointment[] = appointmentsResponse?.data?.appointments || []
  const doctorsList = doctorsResponse || []
  const totalPages = appointmentsResponse?.data?.pages || 1
  const loading = !appointmentsResponse && !fetchError
  const errorValue = fetchError?.response?.status === 401 
    ? 'No access token found. Please login again.' 
    : (fetchError instanceof TypeError && fetchError.message.includes('fetch'))
      ? 'Network error: Could not connect to server. Please check if the backend is running.'
      : (fetchError?.response?.data?.error || fetchError?.message || '')

  useEffect(() => {
    if (errorValue) setError(errorValue)
  }, [errorValue])

  const fetchAppointments = () => {
    mutate()
    globalMutate('dashboard-analytics')
    globalMutate('hospital-profile') // In case stats are linked here
  }

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await api.put(`/hospital/appointments/${appointmentId}`, { status: newStatus })
      toast.success(`Appointment marked as ${newStatus}`)
      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment')
      toast.error('Failed to update status')
    }
  }

  const handleScheduleSubmit = async () => {
    if (!schedulingModal.appointment || !schedulingModal.date || !schedulingModal.time) return

    try {
      await api.put(`/hospital/appointments/${schedulingModal.appointment.id}`, {
        status: 'scheduled',
        appointment_date: schedulingModal.date,
        appointment_time: schedulingModal.time
      })
      toast.success('Appointment scheduled successfully')
      setSchedulingModal({ show: false, appointment: null, date: '', time: '' })
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule appointment')
      toast.error('Failed to schedule appointment')
    }
  }

  const handleReportUpload = async () => {
    if (!reportModal.appointment || !reportModal.file) return;

    setReportModal(prev => ({ ...prev, uploading: true }));
    const formData = new FormData();
    formData.append('file', reportModal.file);

    try {
      await api.post(`/hospital/appointments/${reportModal.appointment.id}/upload-report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Medical report uploaded successfully');
      setReportModal({ show: false, appointment: null, file: null, uploading: false });
      fetchAppointments();
    } catch (err) {
      console.error('Error uploading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload report');
      toast.error('Failed to upload report');
      setReportModal(prev => ({ ...prev, uploading: false }));
    }
  };

  const cancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      await api.put(`/hospital/appointments/${appointmentId}/cancel`)
      toast.success('Appointment cancelled')
      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
      toast.error('Failed to cancel appointment')
    }
  }

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/hospital/appointments/${appointmentId}`)
      toast.success('Appointment deleted permanently')
      // Refresh appointments
      fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment')
      toast.error('Failed to delete appointment')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      requested: 'bg-yellow-100 text-yellow-800',
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

  // Skeleton row component for loading state
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="flex items-center"><div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 mr-3"></div><div><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-1"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></div></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-1"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-1"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-14"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div></td>
      <td className="px-6 py-4"><div className="flex space-x-2"><div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded"></div><div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded"></div></div></td>
    </tr>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appointment Management</h1>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg">Schedule and manage patient appointments</p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <span className="bg-indigo-500/50 dark:bg-indigo-600/50 px-3 py-1 rounded-full">
                📅 {appointments.length} Total Appointments
              </span>
              <span className="bg-indigo-500/50 dark:bg-indigo-600/50 px-3 py-1 rounded-full">
                ✅ {appointments.filter(a => a.status === 'scheduled').length} Scheduled
              </span>
            </div>
          </div>
          <Link
            href="/hospital/dashboard/appointments/book"
            className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center space-x-2 font-semibold shadow-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
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
            <label className="block text-sm font-medium text-primary mb-2">Doctor</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Doctors</option>
              {doctorsList.map((doc: any) => (
                <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter('')
                setStatusFilter('')
                setDoctorFilter('')
              }}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-card rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appointment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-primary mb-2">No appointments found</h3>
                    <p className="text-secondary mb-4">Start by booking your first appointment.</p>
                    <Link
                      href="/hospital/dashboard/appointments/book"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center space-x-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Book Appointment</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.appointment_date)
                  return (
                    <tr key={appointment.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.appointment_id}</div>
                          <div className="text-sm text-gray-500">{appointment.appointment_type}</div>
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
                            <div className="text-sm font-medium text-gray-900">{appointment.patient.name}</div>
                            <div className="text-sm text-gray-500">{appointment.patient.age}y, {appointment.patient.gender}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {appointment.patient.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Dr. {appointment.doctor.name}</div>
                        <div className="text-sm text-gray-500">{appointment.doctor.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />{time}
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
                          {appointment.status === 'requested' && (
                            <button onClick={() => { const dt = new Date(appointment.appointment_date); setSchedulingModal({ show: true, appointment, date: dt.toISOString().split('T')[0], time: dt.toTimeString().split(' ')[0].substring(0, 5) }) }} className="text-blue-600 hover:text-blue-900 p-1 rounded" title="Schedule Appointment">
                              <ClockIcon className="h-4 w-4" />
                            </button>
                          )}
                          {appointment.status === 'scheduled' && (
                            <button onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')} className="text-green-600 hover:text-green-900 p-1 rounded transition-transform hover:scale-125" title="Confirm Appointment">
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                            <button onClick={() => updateAppointmentStatus(appointment.id, 'completed')} className="text-blue-600 hover:text-blue-900 p-1 rounded transition-transform hover:scale-125" title="Mark as Completed">
                              <CheckBadgeIcon className="h-5 w-5" />
                            </button>
                          )}
                          {appointment.status === 'completed' && (
                            <button onClick={() => setReportModal({ ...reportModal, show: true, appointment })} className={`${appointment.report_url ? 'text-green-600 hover:text-green-900' : 'text-indigo-600 hover:text-indigo-900'} p-1 rounded transition-transform hover:scale-125`} title={appointment.report_url ? 'Update Medical Report' : 'Upload Medical Report'}>
                              <ArrowUpTrayIcon className="h-5 w-5" />
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <button onClick={() => cancelAppointment(appointment.id)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-transform hover:scale-125" title="Cancel Appointment">
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button onClick={() => deleteAppointment(appointment.id)} className="text-red-600 hover:text-red-900 p-1 rounded transition-transform hover:scale-125" title="Delete Permanently">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-primary px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-400">
                  Showing page <span className="font-medium text-indigo-600 dark:text-indigo-400">{currentPage}</span> of{' '}
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduling Modal */}
      {schedulingModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold text-primary mb-4">Schedule Appointment</h2>
            <p className="text-sm text-secondary mb-6">
              Assing a final date and time for <strong>{schedulingModal.appointment?.patient.name}'s</strong> request with <strong>Dr. {schedulingModal.appointment?.doctor.name}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={schedulingModal.date}
                  onChange={(e) => setSchedulingModal({ ...schedulingModal, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
                <input
                  type="time"
                  value={schedulingModal.time}
                  onChange={(e) => setSchedulingModal({ ...schedulingModal, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setSchedulingModal({ show: false, appointment: null, date: '', time: '' })}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-all active:scale-95"
              >
                Assign & Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Upload Modal */}
      {reportModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Upload Medical Report</h2>
              <button onClick={() => setReportModal({ ...reportModal, show: false })} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Upload the laboratory or medical report for <strong>{reportModal.appointment?.patient.name}</strong>. This will be visible in their patient portal.
            </p>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors pointer-events-auto">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.xls,.xlsx,.csv,.gif,.bmp,.webp"
                  id="report-upload"
                  className="hidden"
                  onChange={(e) => setReportModal({ ...reportModal, file: e.target.files?.[0] || null })}
                />
                <label htmlFor="report-upload" className="cursor-pointer block">
                  <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600 block mb-1">
                    {reportModal.file ? reportModal.file.name : 'Click to select report file'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, Images, or Documents up to 10MB</span>
                </label>
              </div>

              {reportModal.file && (
                <div className="bg-blue-50 p-3 rounded-lg flex items-center text-blue-800 text-sm">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>File ready for upload</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setReportModal({ ...reportModal, show: false })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!reportModal.file || reportModal.uploading}
                  onClick={handleReportUpload}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {reportModal.uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : 'Upload Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}