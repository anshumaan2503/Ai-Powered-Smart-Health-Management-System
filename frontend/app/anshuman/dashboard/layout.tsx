'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShieldCheckIcon,
  HomeIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/anshuman/dashboard', icon: HomeIcon },
  { name: 'Hospitals', href: '/anshuman/dashboard/hospitals', icon: BuildingOffice2Icon },
  { name: 'Subscriptions', href: '/anshuman/dashboard/subscriptions', icon: CreditCardIcon },
  { name: 'Analytics', href: '/anshuman/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/anshuman/dashboard/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/anshuman/dashboard/settings', icon: CogIcon },
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('admin_token')
    const adminUserData = localStorage.getItem('admin_user')
    
    if (!adminToken || adminToken !== 'admin_authenticated') {
      router.push('/anshuman')
      return
    }
    
    if (adminUserData) {
      setAdminUser(JSON.parse(adminUserData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/anshuman')
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <ShieldCheckIcon className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-xl font-bold text-white">Admin Portal</span>
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              Super Administrator
            </p>
            <p className="text-xs text-gray-400">System Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            View Public Site
          </Link>
        </div>
      </div>

      {/* Admin Info & Logout */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{adminUser.username}</p>
              <p className="text-xs text-gray-400 capitalize">{adminUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-gray-900 p-2 rounded-lg shadow-md border border-gray-700"
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                🔒 Administrative Control Panel
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Security Badge */}
              <div className="hidden md:flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                Secure Access
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
              
              {/* Admin info (desktop) */}
              <Link 
                href="/anshuman/dashboard/settings"
                className="hidden md:flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">A</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}