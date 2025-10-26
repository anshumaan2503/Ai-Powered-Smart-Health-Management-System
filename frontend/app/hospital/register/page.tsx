'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export default function HospitalRegisterPage() {
  const [formData, setFormData] = useState({
    hospital_name: '',
    hospital_address: '',
    hospital_phone: '',
    hospital_email: '',
    license_number: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_phone: '',
    admin_password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  const router = useRouter()

  const validateStep = (step: number) => {
    const newErrors: any = {}

    if (step === 1) {
      // Hospital Information
      if (!formData.hospital_name.trim()) {
        newErrors.hospital_name = 'Hospital name is required'
      }
      if (!formData.hospital_address.trim()) {
        newErrors.hospital_address = 'Hospital address is required'
      }
      if (!formData.hospital_phone.trim()) {
        newErrors.hospital_phone = 'Hospital phone is required'
      }
    } else if (step === 2) {
      // Admin Information
      if (!formData.admin_first_name.trim()) {
        newErrors.admin_first_name = 'Admin first name is required'
      }
      if (!formData.admin_last_name.trim()) {
        newErrors.admin_last_name = 'Admin last name is required'
      }
      if (!formData.admin_email.trim()) {
        newErrors.admin_email = 'Admin email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
        newErrors.admin_email = 'Invalid email format'
      }
    } else if (step === 3) {
      // Password Information
      if (!formData.admin_password) {
        newErrors.admin_password = 'Password is required'
      }
      // Allow any password - no length or complexity requirements

      if (formData.admin_password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await api.post('/hospital-auth/register', formData)
      toast.success('Hospital registered successfully!')
      router.push('/hospital/login?message=Registration successful! Please login with your admin credentials.')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to register hospital'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Hospital Information'
      case 2: return 'Admin Account'
      case 3: return 'Security Setup'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center">
            <BuildingOffice2Icon className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">MediCare Pro</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Register Your Hospital
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join thousands of hospitals using our management system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => {
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
                      <span className="text-sm font-medium">{step}</span>
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

          {/* Form */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Hospital Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <BuildingOffice2Icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">Hospital Information</h3>
                    <p className="text-gray-600">Tell us about your hospital</p>
                  </div>

                  <div>
                    <label htmlFor="hospital_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      id="hospital_name"
                      name="hospital_name"
                      type="text"
                      required
                      value={formData.hospital_name}
                      onChange={handleInputChange}
                      className={`input-field ${errors.hospital_name ? 'border-red-500' : ''}`}
                      placeholder="City General Hospital"
                    />
                    {errors.hospital_name && <p className="mt-1 text-sm text-red-600">{errors.hospital_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="hospital_address" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Address *
                    </label>
                    <textarea
                      id="hospital_address"
                      name="hospital_address"
                      rows={3}
                      required
                      value={formData.hospital_address}
                      onChange={handleInputChange}
                      className={`input-field ${errors.hospital_address ? 'border-red-500' : ''}`}
                      placeholder="123 Medical Center Drive, Healthcare City, HC 12345"
                    />
                    {errors.hospital_address && <p className="mt-1 text-sm text-red-600">{errors.hospital_address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="hospital_phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Phone *
                      </label>
                      <div className="relative">
                        <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          id="hospital_phone"
                          name="hospital_phone"
                          type="tel"
                          required
                          value={formData.hospital_phone}
                          onChange={handleInputChange}
                          className={`input-field pl-10 ${errors.hospital_phone ? 'border-red-500' : ''}`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {errors.hospital_phone && <p className="mt-1 text-sm text-red-600">{errors.hospital_phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="hospital_email" className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Email
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          id="hospital_email"
                          name="hospital_email"
                          type="email"
                          value={formData.hospital_email}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="info@hospital.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number (Optional)
                    </label>
                    <input
                      id="license_number"
                      name="license_number"
                      type="text"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="HOS-2024-001"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Admin Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">Admin Account</h3>
                    <p className="text-gray-600">Create the main administrator account</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="admin_first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Admin First Name *
                      </label>
                      <input
                        id="admin_first_name"
                        name="admin_first_name"
                        type="text"
                        required
                        value={formData.admin_first_name}
                        onChange={handleInputChange}
                        className={`input-field ${errors.admin_first_name ? 'border-red-500' : ''}`}
                        placeholder="John"
                      />
                      {errors.admin_first_name && <p className="mt-1 text-sm text-red-600">{errors.admin_first_name}</p>}
                    </div>

                    <div>
                      <label htmlFor="admin_last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Last Name *
                      </label>
                      <input
                        id="admin_last_name"
                        name="admin_last_name"
                        type="text"
                        required
                        value={formData.admin_last_name}
                        onChange={handleInputChange}
                        className={`input-field ${errors.admin_last_name ? 'border-red-500' : ''}`}
                        placeholder="Doe"
                      />
                      {errors.admin_last_name && <p className="mt-1 text-sm text-red-600">{errors.admin_last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="admin_email"
                        name="admin_email"
                        type="email"
                        required
                        value={formData.admin_email}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.admin_email ? 'border-red-500' : ''}`}
                        placeholder="admin@hospital.com"
                      />
                    </div>
                    {errors.admin_email && <p className="mt-1 text-sm text-red-600">{errors.admin_email}</p>}
                  </div>

                  <div>
                    <label htmlFor="admin_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Phone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="admin_phone"
                        name="admin_phone"
                        type="tel"
                        value={formData.admin_phone}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Security Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <LockClosedIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">Security Setup</h3>
                    <p className="text-gray-600">Create a password for the admin account (any length, any characters)</p>
                  </div>

                  <div>
                    <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Password *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="admin_password"
                        name="admin_password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.admin_password}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-10 ${errors.admin_password ? 'border-red-500' : ''}`}
                        placeholder="Enter any password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.admin_password && <p className="mt-1 text-sm text-red-600">{errors.admin_password}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  {/* Trial Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">🎉 30-Day Free Trial</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Up to 50 patients</li>
                      <li>• Up to 3 doctors</li>
                      <li>• Up to 5 staff members</li>
                      <li>• Basic management features</li>
                      <li>• Appointment scheduling</li>
                      <li>• Medical records</li>
                    </ul>
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
                      ← Previous
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
                      Next →
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
                          Register Hospital
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have a hospital account?{' '}
            <Link href="/hospital/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}