'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeartIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

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
      // Use axios directly to avoid patient token interference
      const response = await fetch('http://localhost:5000/api/hospital-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        // Store tokens and data
        localStorage.setItem('hospital_access_token', data.access_token)
        localStorage.setItem('hospital_refresh_token', data.refresh_token)
        localStorage.setItem('hospital_user', JSON.stringify(data.user))
        localStorage.setItem('hospital_data', JSON.stringify(data.hospital))
        
        toast.success('Login successful!')
        
        // Redirect to hospital dashboard
        router.push('/hospital/dashboard')
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error: any) {
      console.error('Hospital login error:', error)
      const errorMessage = error.message || 'Login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center">
            <BuildingOfficeIcon className="h-12 w-12 text-green-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">MediCare Pro</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Hospital Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your hospital management system
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </a>
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Other options</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-blue-300 rounded-lg shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors duration-200"
              >
                👤 Patient Login
              </Link>
              <Link
                href="/hospital/register"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Register New Hospital
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Demo Hospital Credentials</h3>
          <div className="text-xs text-green-700 space-y-2">
            <div className="font-medium">Hospital Admin Login:</div>
            <div className="ml-2">
              <div><strong>Email:</strong> admin@hospital.com</div>
              <div><strong>Password:</strong> 123</div>
            </div>
            <div className="font-medium mt-2">Other Hospital Admins:</div>
            <div className="ml-2">
              <div><strong>City Hospital:</strong> city@hospital.com</div>
              <div><strong>Apollo:</strong> apollo@hospital.com</div>
              <div><strong>Fortis:</strong> fortis@hospital.com</div>
              <div><strong>Password:</strong> 123 (for all)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}