'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load components to avoid import issues
const DashboardSidebar = dynamic(() => import('@/components/dashboard/sidebar').then(mod => ({ default: mod.DashboardSidebar })), {
  loading: () => <div className="w-64 bg-white border-r border-gray-200"></div>
})

const DashboardHeader = dynamic(() => import('@/components/dashboard/header').then(mod => ({ default: mod.DashboardHeader })), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

import dynamic from 'next/dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200"></div>}>
        <DashboardSidebar />
      </Suspense>
      <div className="lg:pl-64">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <DashboardHeader />
        </Suspense>
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}