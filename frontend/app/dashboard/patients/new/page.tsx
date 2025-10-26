'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { patientsAPI } from '@/lib/api'
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewPatientPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    allergies: '',
    medical_history: '',
    insurance_number: ''
  })
  
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  const router = useRouter()

  const validateStep = (step: number) => {
    const newErrors: any = {}

    if (step === 1) {
      // Personal Information
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required'
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required'
      }
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required'
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      }
    } else if (step === 2) {
      // Contact Information
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format'
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return

    setIsLoading(true)

    try {
      const response = await patientsAPI.create(formData)
      toast.success('Patient registered successfully!')
      router.push(`/dashboard/patients/${response.data.patient.id}`)
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to register patient'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Personal Information'
      case 2: return 'Contact & Address'
      case 3: return 'Medical Information'
      default: return ''
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return UserIcon
      case 2: return PhoneIcon
      case 3: return HeartIcon
      default: return UserIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/patients"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserPlusIcon className="h-8 w-8 text-blue-600 mr-3" />
              Add New Patient
            </h1>
            <p className="text-gray-600 mt-1">
              Register a new patient in the system
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => {
            const StepIcon = getStepIcon(step)
            const isActive = step === currentStep
            const isCompleted = step < currentStep
            
            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    Step {step}
                  </p>
                  <p className={`text-xs ${
                    isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {getStepTitle(step)}
                  </p>
                </div>
                {step < totalSteps && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                <p className="text-gray-600">Basic patient details and identification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.date_of_birth ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>

                <div>
                  <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    id="blood_group"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <PhoneIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Contact & Address</h2>
                <p className="text-gray-600">Contact information and emergency contacts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="patient@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <HeartIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
                <p className="text-gray-600">Medical history and insurance details</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                    Known Allergies
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={3}
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="List any known allergies (medications, food, environmental, etc.)"
                  />
                </div>

                <div>
                  <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    id="medical_history"
                    name="medical_history"
                    rows={4}
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Previous medical conditions, surgeries, chronic illnesses, etc."
                  />
                </div>

                <div>
                  <label htmlFor="insurance_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Number
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      id="insurance_number"
                      name="insurance_number"
                      type="text"
                      value={formData.insurance_number}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Insurance policy number"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-secondary flex items-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center"
                >
                  Next
                  <ArrowLeftIcon className="h-5 w-5 ml-2 rotate-180" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Register Patient
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}