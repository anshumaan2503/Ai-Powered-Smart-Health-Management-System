'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all stored data
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Redirect to home after clearing
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Clearing Browser Data...</h2>
        <p className="text-gray-600">Redirecting to home page...</p>
      </div>
    </div>
  )
}