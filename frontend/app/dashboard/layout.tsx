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

/**
 * Provides the authenticated dashboard page layout (sidebar, header, and main content) and enforces redirect to the login page for unauthenticated users.
 *
 * The component renders the full dashboard markup and uses React Suspense fallbacks for lazily loaded sidebar, header, and main content areas. If authentication finishes and there is no user, the component triggers a client-side redirect to `/login`.
 *
 * @param children - Page content rendered in the dashboard's main area
 * @returns The dashboard layout element containing the sidebar, header, and main content
 */
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