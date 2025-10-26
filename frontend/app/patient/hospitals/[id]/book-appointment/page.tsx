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
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('consultation')
  const [symptoms, setSymptoms] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      // Fetch real doctors for this hospital
      const response = await api.get(`/hospital-auth/hospitals/${params.id}/doctors`)
      setDoctors(response.data.doctors || [])
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
      // Mock booking - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Appointment booked successfully!')
      router.push('/patient/appointments')
    } catch (error) {
      toast.error('Failed to book appointment')
    } finally {
      setIsBooking(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Book Appointment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Appointment</h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Doctor
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-sm font-medium text-green-600">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedDoctor.available_times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-sm border rounded-lg transition-colors ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Doctor:</span>
                      <span className="font-medium">{selectedDoctor.name}</span>
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
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
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
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Book Appointment
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