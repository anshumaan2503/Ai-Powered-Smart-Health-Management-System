'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  HeartIcon,
  BeakerIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: 'Doctors', href: '/dashboard/doctors', icon: UserIcon, roles: ['admin', 'receptionist'] },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: 'Medical Records', href: '/dashboard/records', icon: DocumentTextIcon, roles: ['admin', 'doctor', 'nurse'] },
  { name: 'AI Diagnosis', href: '/dashboard/ai-diagnosis', icon: BeakerIcon, roles: ['admin', 'doctor'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
]

export function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role || '')
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <HeartIcon className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">MediCare Pro</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          © 2024 MediCare Pro
        </p>
      </div>
    </div>
  )

  return (
    <>
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
    </>
  )
}