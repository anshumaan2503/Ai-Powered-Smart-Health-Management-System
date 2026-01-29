'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { ThemeToggleButton } from '@/components/ui/ThemeToggle'

export default function HospitalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/hospital-auth/login', {
        email,
        password,
      })

      const data = response.data

      if (!data?.access_token) {
        throw new Error('No access token received from server')
      }

      // ✅ Store tokens + hospital info
      localStorage.setItem('hospital_access_token', data.access_token)

      if (data.refresh_token) {
        localStorage.setItem('hospital_refresh_token', data.refresh_token)
      }

      if (data.user) {
        localStorage.setItem('hospital_user', JSON.stringify(data.user))
      }

      if (data.hospital) {
        localStorage.setItem('hospital_data', JSON.stringify(data.hospital))
      }

      toast.success('Hospital login successful!')
      router.push('/hospital/dashboard')
    } catch (error: any) {
      console.error('Hospital login error:', error)

      // ✅ Better error message extraction
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.'

      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center">
            <BuildingOfficeIcon className="h-12 w-12 text-green-600 dark:text-green-500" />
            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">MediCare Pro</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Hospital Login</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your hospital management system</p>
        </div>

        {/* Backend Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                First-time login may take up to 30–60 seconds.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Our backend may be waking up from idle. Please wait — no action is required.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your hospital email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in to Hospital System'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-blue-300 dark:border-blue-600 rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              👤 Patient Login
            </Link>

            <Link
              href="/hospital/register"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Register New Hospital
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
