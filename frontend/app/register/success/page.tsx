'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircleIcon,
  HeartIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)
  
  const userName = searchParams.get('name') || 'Patient'
  const userEmail = searchParams.get('email') || ''

  useEffect(() => {
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleLoginNow = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          
          <Link href="/" className="flex items-center justify-center mb-4 hover:opacity-80 transition">
            <HeartIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">MediCare Pro</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to MediCare Pro!
          </h1>
          <p className="text-lg text-gray-600">
            Your account has been created successfully
          </p>
        </div>

        {/* Success Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🎉 Registration Complete!
            </h2>
            <p className="text-gray-600">
              Hello <span className="font-medium text-blue-600">{userName}</span>, 
              your patient account is ready to use.
            </p>
          </div>

          {/* Account Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-3">Your Account Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-gray-700">Name: </span>
                <span className="font-medium ml-1">{userName}</span>
              </div>
              {userEmail && (
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="text-gray-700">Email: </span>
                  <span className="font-medium ml-1">{userEmail}</span>
                </div>
              )}
              <div className="flex items-center">
                <HeartIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-gray-700">Role: </span>
                <span className="font-medium ml-1">Patient</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">What you can do now:</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Browse Hospitals</p>
                  <p className="text-sm text-gray-600">Find the best healthcare providers in your area</p>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Book Appointments</p>
                  <p className="text-sm text-gray-600">Schedule consultations with doctors</p>
                </div>
              </div>
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Manage Health Records</p>
                  <p className="text-sm text-gray-600">Access your medical history and reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLoginNow}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              Login to Your Account
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Auto-redirecting to login in{' '}
                <span className="font-medium text-blue-600">{countdown}</span> seconds
              </p>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-500 block"
          >
            ← Back to Home
          </Link>
          <Link
            href="/hospital/register"
            className="text-sm text-blue-600 hover:text-blue-500 block"
          >
            Register as Hospital →
          </Link>
        </div>
      </div>
    </div>
  )
}