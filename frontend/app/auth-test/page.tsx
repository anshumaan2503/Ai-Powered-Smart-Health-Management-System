'use client'

import { useAuth } from '@/lib/auth-context'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

export default function AuthTestPage() {
  const { user, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loading State:</label>
            <p className="text-sm text-gray-600">{isLoading ? 'Loading...' : 'Loaded'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User State:</label>
            <p className="text-sm text-gray-600">{user ? 'Logged In' : 'Not Logged In'}</p>
          </div>
          
          {user && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">User Details:</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Local Storage:</label>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Access Token: {typeof window !== 'undefined' && localStorage.getItem('access_token') ? 'Present' : 'Missing'}</p>
              <p>Refresh Token: {typeof window !== 'undefined' && localStorage.getItem('refresh_token') ? 'Present' : 'Missing'}</p>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          )}
          
          <div className="pt-4 space-y-2">
            <Link 
              href="/login" 
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
            <Link 
              href="/patient/dashboard" 
              className="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Patient Dashboard
            </Link>
            <Link 
              href="/" 
              className="block w-full text-center text-gray-600 hover:text-gray-500 font-medium py-2 px-4"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}