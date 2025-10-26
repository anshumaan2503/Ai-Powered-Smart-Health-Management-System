'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BuildingOffice2Icon,
  UserIcon,
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function AuthSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center">
            <HeartIcon className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">MediCare Pro</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Choose Your Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select the appropriate login portal for your role
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hospital Portal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/hospital/login"
              className="block bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <BuildingOffice2Icon className="h-10 w-10 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Hospital Portal
                </h3>
                
                <p className="text-gray-600 mb-6">
                  For hospital administrators, doctors, nurses, and staff members to manage hospital operations.
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Manage patients and appointments
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Staff and doctor management
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Hospital analytics and reports
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Subscription and billing
                  </div>
                </div>
                
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  Access Hospital Portal
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                New hospital?{' '}
                <Link href="/hospital/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Patient Portal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/patient/login"
              className="block bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <UserIcon className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Patient Portal
                </h3>
                
                <p className="text-gray-600 mb-6">
                  For patients to access their medical records, book appointments, and communicate with doctors.
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    View medical records
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Book appointments online
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Communicate with doctors
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Download reports
                  </div>
                </div>
                
                <div className="flex items-center justify-center text-green-600 font-medium">
                  Access Patient Portal
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </div>
              </div>
            </Link>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                New patient?{' '}
                <Link href="/patient/register" className="font-medium text-green-600 hover:text-green-500">
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}