'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserIcon,
  ArrowRightIcon,
  HeartIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { ThemeToggleButton } from '@/components/ui/ThemeToggle'

export default function DoctorPortalPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if doctor is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'doctor') {
          // Already logged in, redirect to dashboard
          router.push('/doctor/dashboard')
          return
        }
      } catch (e) {
        // Invalid user data, continue to login
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Doctor Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Access your medical dashboard and manage your appointments
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 transition-colors duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to MediCare Pro
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Sign in to view your appointments, manage patients, and access your medical records.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors">
              <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Appointments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your daily schedule</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg transition-colors">
              <UserGroupIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Patients</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access patient records and history</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg transition-colors">
              <DocumentTextIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage medical records securely</p>
            </div>
          </div>

          {/* Login Button */}
          <div className="space-y-4">
            <Link
              href="/doctor/login"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Sign In to Doctor Portal</span>
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Help Text */}
            <div className="text-center space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account? Contact your hospital administrator.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <Link
                  href="/hospital/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                >
                  <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                  Hospital Admin Portal
                </Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
                >
                  <HeartIcon className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure access to your medical practice management system
          </p>
        </div>
      </div>
    </div>
  )
}

