'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  HeartIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { processPayment } from '@/lib/razorpay-service'

interface Doctor {
  id: number
  name: string
  specialization: string
  consultation_fee: number
  available_days: string[]
  available_times: string[]
}

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('consultation')
  const [symptoms, setSymptoms] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [hospital, setHospital] = useState<any>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      // Fetch real doctors for this hospital
      const response = await api.get(`/hospital-auth/hospitals/${params.id}/doctors`)
      setDoctors(response.data.doctors || [])
      setHospital(response.data.hospital || null)
      console.log('Fetched doctors for booking:', response.data.doctors)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      // If API fails, show empty list
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsBooking(true)
    try {
      // First, fetch the current user profile to get patient info
      const profileResponse = await api.get('/auth/profile')
      const userData = profileResponse.data.user || profileResponse.data

      if (!userData.patient_id || !userData.patient_profile_id) {
        toast.error('Patient profile not found. Please complete your profile first.')
        router.push('/patient/profile')
        return
      }

      // Create appointment datetime string
      const appointment_date = `${selectedDate}T${selectedTime}:00`

      // Determine initial status based on payment requirement
      const requiresPayment = selectedDoctor.consultation_fee > 0 && hospital?.payments_enabled !== false;
      const initialStatus = requiresPayment ? 'awaiting_payment' : 'requested';

      const response = await api.post('/appointments/', {
        patient_id: userData.patient_profile_id,
        doctor_id: selectedDoctor.id,
        appointment_date: appointment_date,
        appointment_type: appointmentType,
        symptoms: symptoms,
        status: initialStatus
      })

      const appointment = response.data.appointment
      
      // If there's a fee AND payments are enabled for this hospital, process payment
      if (requiresPayment) {
        processPayment({
          amount: selectedDoctor.consultation_fee,
          paymentType: 'appointment',
          referenceId: appointment.id,
          customerInfo: {
            name: `${user?.first_name} ${user?.last_name}`,
            email: user?.email,
          },
          onSuccess: () => {
             router.push('/patient/appointments?payment=success')
          },
          onFailure: async (error: any) => {
             if (error?.status === 'cancelled') {
               try {
                 await api.delete(`/appointments/${appointment.id}`);
                 toast.error('Booking cancelled.');
               } catch (e) {
                 console.error('Failed to cleanup appointment:', e);
                 toast.error('Payment cancelled.');
               }
               // On cancellation, go back or stay on page
               setIsBooking(false); // Enable booking button again
             } else {
               toast.error('Payment failed. You can retry from your appointments list.');
               router.push('/patient/appointments')
             }
          }
        })
      } else {
        toast.success(hospital?.payments_enabled === false ? 'Appointment requested. Please pay at the hospital.' : 'Appointment booked successfully!')
        router.push('/patient/appointments')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMsg = error.response?.data?.error || 'Failed to book appointment'
      toast.error(errorMsg)
    } finally {
      setIsBooking(false)
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
          <p className="text-gray-600">Please login to book an appointment</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-slate-300" />
              </button>
              <HeartIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-slate-100">Book Appointment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Request Appointment</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Submit your preferred date and time. The hospital will review and confirm or assign a final slot.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Select Doctor
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDoctor?.id === doctor.id
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-slate-100">{doctor.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400">{doctor.specialization}</p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Fee: ₹{doctor.consultation_fee}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              {/* Time Selection */}
              {selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                    Preferred Time Slot
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedDoctor.available_times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-sm border rounded-lg transition-colors ${selectedTime === time
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="input-field"
                >
                  <option value="consultation">General Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="checkup">Regular Checkup</option>
                </select>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Symptoms/Reason for Visit (Optional)
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your symptoms or reason for the appointment..."
                />
              </div>

              {/* Booking Summary */}
              {selectedDoctor && selectedDate && selectedTime && (
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Appointment Summary</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Doctor:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialization:</span>
                      <span>{selectedDoctor.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{appointmentType}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t dark:border-slate-600 pt-2 text-gray-900 dark:text-slate-100">
                      <span>Total Fee:</span>
                      <span>₹{selectedDoctor.consultation_fee}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedDoctor || !selectedDate || !selectedTime || isBooking}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isBooking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Send Appointment Request
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}