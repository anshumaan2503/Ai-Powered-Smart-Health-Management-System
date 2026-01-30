'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Patient {
  id: number
  patient_id: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  age: number
  gender: string
  email?: string
}

interface Doctor {
  id: number
  name: string
  specialization: string
  consultation_fee: number
  qualification: string
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Select Patient, 2: Book Appointment
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Patient selection
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>([])

  // Appointment form
  const [appointmentData, setAppointmentData] = useState({
    doctor_user_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'consultation',
    symptoms: '',
    notes: '',
    priority: 'normal'
  })

  // New patient form
  const [newPatientData, setNewPatientData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPatients()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/hospital/doctors/available')
      if (true) {
        const data = response.data
        setDoctors(data.doctors || [])
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    }
  }

  const searchPatients = async () => {
    try {
      const response = await api.get(`/hospital/patients/search?q=${encodeURIComponent(searchTerm)}`)
      if (true) {
        const data = response.data
        setSearchResults(data.patients || [])
      }
    } catch (err) {
      console.error('Failed to search patients:', err)
    }
  }

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/hospital/quick-patient', newPatientData)

      const data = response.data

      if (false) { }

      setSelectedPatient(data.patient)
      setShowNewPatientForm(false)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient')
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/hospital/appointments', {
        ...appointmentData,
        patient_id: selectedPatient?.id
      })

      const data = response.data

      if (false) { }

      setSuccess('Appointment booked successfully!')
      setTimeout(() => {
        router.push('/hospital/dashboard/appointments')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('patient_')) {
      const fieldName = name.replace('patient_', '')
      setNewPatientData(prev => ({ ...prev, [fieldName]: value }))
    } else {
      setAppointmentData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 animate-fade-in">
          <Link
            href="/hospital/dashboard/appointments"
            className="group p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Book Appointment
            </h1>
            <p className="text-slate-600 mt-1">Schedule a new patient appointment with ease</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up">
          <div className="flex items-center">
            <div className={`flex items-center transition-all duration-500 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= 1
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                : 'bg-slate-200 text-slate-500'
                }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="ml-3 font-semibold text-base">Select Patient</span>
            </div>
            <div className={`flex-1 h-2 mx-6 rounded-full transition-all duration-500 ${step >= 2
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
              : 'bg-slate-200'
              }`}></div>
            <div className={`flex items-center transition-all duration-500 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= 2
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                : 'bg-slate-200 text-slate-500'
                }`}>
                2
              </div>
              <span className="ml-3 font-semibold text-base">Book Appointment</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-5 shadow-lg animate-shake">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-lg animate-bounce-in">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Step 1: Select Patient */}
        {step === 1 && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <UserIcon className="h-7 w-7 text-indigo-600 mr-3" />
              Select Patient
            </h3>

            {!showNewPatientForm ? (
              <div className="space-y-6">
                {/* Search Patients */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    🔍 Search Existing Patient
                  </label>
                  <div className="relative group">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, phone, or patient ID..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border-2 border-slate-200 rounded-xl max-h-80 overflow-y-auto bg-white/50 backdrop-blur-sm">
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient)
                          setStep(2)
                        }}
                        className="p-5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-all duration-300 group"
                      >
                        <div className="flex items-center">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <UserIcon className="h-7 w-7 text-indigo-600" />
                          </div>
                          <div className="ml-5 flex-1">
                            <div className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {patient.full_name}
                            </div>
                            <div className="text-sm text-slate-600 mt-1 flex items-center space-x-2">
                              <span className="inline-flex items-center">📱 {patient.phone}</span>
                              <span>•</span>
                              <span>{patient.age}y, {patient.gender}</span>
                              <span>•</span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">ID: {patient.patient_id}</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-indigo-600 font-medium">Select →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Or Create New Patient */}
                <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl border-2 border-dashed border-slate-300">
                  <p className="text-slate-600 mb-4 font-medium">Patient not found?</p>
                  <button
                    onClick={() => setShowNewPatientForm(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New Patient</span>
                  </button>
                </div>
              </div>
            ) : (
              /* New Patient Form */
              <form onSubmit={handleNewPatientSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 text-emerald-600 mr-2" />
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        👤 First Name *
                      </label>
                      <input
                        type="text"
                        name="patient_first_name"
                        value={newPatientData.first_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 bg-white shadow-sm"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        👤 Last Name *
                      </label>
                      <input
                        type="text"
                        name="patient_last_name"
                        value={newPatientData.last_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 bg-white shadow-sm"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        📱 Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="patient_phone"
                        value={newPatientData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 bg-white shadow-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        📧 Email Address
                      </label>
                      <input
                        type="email"
                        name="patient_email"
                        value={newPatientData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 bg-white shadow-sm"
                        placeholder="patient@email.com (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        🎂 Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="patient_date_of_birth"
                        value={newPatientData.date_of_birth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 bg-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        ⚧️ Gender *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'male', label: '👨 Male' },
                          { value: 'female', label: '👩 Female' },
                          { value: 'other', label: '🧑 Other' }
                        ].map((gender) => (
                          <button
                            key={gender.value}
                            type="button"
                            onClick={() => setNewPatientData(prev => ({ ...prev, gender: gender.value }))}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${newPatientData.gender === gender.value
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                          >
                            {gender.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t-2 border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewPatientForm(false)}
                    className="px-6 py-3.5 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-sm hover:shadow-md"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-3.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Patient...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5" />
                        <span>👤 Create & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 2: Book Appointment */}
        {step === 2 && selectedPatient && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <CalendarIcon className="h-7 w-7 text-indigo-600 mr-3" />
              Book Appointment
            </h3>

            {/* Selected Patient Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border-2 border-indigo-100 shadow-sm">
              <h4 className="font-semibold text-slate-700 mb-4 flex items-center">
                <span className="text-indigo-600 mr-2">✓</span>
                Selected Patient
              </h4>
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-lg font-bold text-slate-900">
                    {selectedPatient.full_name}
                  </div>
                  <div className="text-sm text-slate-600 mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center">📱 {selectedPatient.phone}</span>
                    <span>•</span>
                    <span>{selectedPatient.age}y, {selectedPatient.gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Form */}
            <form onSubmit={handleAppointmentSubmit} className="space-y-8">
              {/* Doctor & Type Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  Doctor & Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      👨‍⚕️ Select Doctor *
                    </label>
                    <div className="relative">
                      <select
                        name="doctor_user_id"
                        value={appointmentData.doctor_user_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 bg-white shadow-sm"
                      >
                        <option value="">Choose a doctor...</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} • {doctor.specialization} • ₹{doctor.consultation_fee}
                          </option>
                        ))}
                      </select>
                    </div>
                    {appointmentData.doctor_user_id && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ Doctor selected successfully
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📋 Appointment Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'consultation', label: '🩺 Consultation', color: 'blue' },
                        { value: 'follow-up', label: '🔄 Follow-up', color: 'green' },
                        { value: 'emergency', label: '🚨 Emergency', color: 'red' },
                        { value: 'checkup', label: '✅ Checkup', color: 'purple' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setAppointmentData(prev => ({ ...prev, appointment_type: type.value }))}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${appointmentData.appointment_type === type.value
                            ? `border-${type.color}-400 bg-${type.color}-50 text-${type.color}-700`
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                  Schedule Appointment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📅 Date *
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={appointmentData.appointment_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-200 focus:border-green-400 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🕐 Time *
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={appointmentData.appointment_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-200 focus:border-green-400 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      ⚡ Priority Level
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'low', label: '🟢 Low', color: 'green' },
                        { value: 'normal', label: '🟡 Normal', color: 'yellow' },
                        { value: 'high', label: '🟠 High', color: 'orange' },
                        { value: 'emergency', label: '🔴 Emergency', color: 'red' }
                      ].map((priority) => (
                        <label key={priority.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value={priority.value}
                            checked={appointmentData.priority === priority.value}
                            onChange={handleInputChange}
                            className="mr-3 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{priority.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms & Notes */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 text-purple-600 mr-2" />
                  Medical Information
                </h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🩺 Patient Symptoms
                    </label>
                    <textarea
                      name="symptoms"
                      value={appointmentData.symptoms}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Describe the patient's symptoms in detail..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Include duration, severity, and any relevant details
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📝 Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={appointmentData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Any special instructions or additional information..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-sm hover:shadow-md"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back to Patient Selection</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Booking Appointment...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-5 w-5" />
                      <span>📅 Book Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}