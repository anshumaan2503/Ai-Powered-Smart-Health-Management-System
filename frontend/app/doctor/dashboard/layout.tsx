'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  UserIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: HomeIcon },
  { name: 'My Patients', href: '/doctor/dashboard/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/doctor/dashboard/appointments', icon: CalendarIcon },
  { name: 'Medical Records', href: '/doctor/dashboard/records', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/doctor/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/doctor/dashboard/settings', icon: CogIcon },
]

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [hospital, setHospital] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    const hospitalData = localStorage.getItem('hospital')
    
    if (!userData) {
      router.push('/doctor/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    
    // Check if user is a doctor
    if (parsedUser.role !== 'doctor') {
      router.push('/doctor/login')
      return
    }
    
    setUser(parsedUser)
    if (hospitalData) {
      setHospital(JSON.parse(hospitalData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('hospital')
    router.push('/doctor/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <UserIcon className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">Doctor Portal</span>
      </div>

      {/* Doctor Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              Dr. {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-blue-600">Cardiology Specialist</p>
            <p className="text-xs text-gray-500">{hospital?.name}</p>
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
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Hospital Link & Logout */}
      <div className="px-6 py-4 border-t border-gray-200 space-y-2">
        <Link
          href="/hospital/login"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <BuildingOffice2Icon className="h-4 w-4 mr-2" />
          Hospital Admin Portal
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center text-sm text-red-600 hover:text-red-700"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-white p-2 rounded-lg shadow-md border border-gray-200"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Medical Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
              
              {/* User info (desktop) */}
              <Link 
                href="/doctor/dashboard/settings"
                className="hidden md:flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Cardiology</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
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