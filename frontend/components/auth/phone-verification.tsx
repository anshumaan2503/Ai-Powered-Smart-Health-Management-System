'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PhoneVerificationProps {
  phoneNumber: string
  onVerified: () => void
  onBack: () => void
}

export function PhoneVerification({ phoneNumber, onVerified, onBack }: PhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would verify the code with your backend
      if (verificationCode === '123456') {
        onVerified()
      } else {
        setError('Invalid verification code. Try 123456 for demo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      // Simulate sending new code
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('New verification code sent!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <PhoneIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Verify your phone number
        </h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-900">
          {phoneNumber}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            id="verification-code"
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '') // Only digits
              setVerificationCode(value)
              setError('')
            }}
            className={`input-field text-center text-lg tracking-widest ${error ? 'border-red-500' : ''}`}
            placeholder="000000"
            autoComplete="one-time-code"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Verify Phone Number
            </>
          )}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
        >
          Resend verification code
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to registration
        </button>
      </div>

      {/* Demo Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Demo Instructions</h4>
        <p className="text-xs text-blue-700">
          For demo purposes, use verification code: <strong>123456</strong>
        </p>
      </div>
    </motion.div>
  )
}