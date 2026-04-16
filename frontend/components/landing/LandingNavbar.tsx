'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggleButton } from '@/components/ui/ThemeToggle'
import { HeartIcon } from '@heroicons/react/24/outline'

export function LandingNavbar() {
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);
  const [isHospitalLoggedIn, setIsHospitalLoggedIn] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  useEffect(() => {
    const patientToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (patientToken) {
      setIsPatientLoggedIn(true);
      try {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setPatientName(user.first_name || 'Patient');
        }
      } catch (e) {
        setPatientName('Patient');
      }
    }

    const hospitalToken = localStorage.getItem('hospital_access_token');
    if (hospitalToken) {
      setIsHospitalLoggedIn(true);
      try {
        const hospitalData = localStorage.getItem('hospital_data');
        if (hospitalData) {
          const hospital = JSON.parse(hospitalData);
          setHospitalName(hospital.name || 'Hospital');
        }
      } catch (e) {
        setHospitalName('Hospital');
      }
    }
  }, []);

  const handleLogout = (type: 'patient' | 'hospital') => {
    if (type === 'patient') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      setIsPatientLoggedIn(false);
    } else {
      localStorage.removeItem('hospital_access_token');
      localStorage.removeItem('hospital_refresh_token');
      localStorage.removeItem('hospital_user');
      localStorage.removeItem('hospital_data');
      setIsHospitalLoggedIn(false);
    }
    window.location.href = '/';
  };

  return (
    <nav className="bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <HeartIcon className="h-8 w-8 text-blue-600 dark:text-blue-500 group-hover:scale-105 transition-transform" />
            </div>
            <span className="ml-2.5 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              MediCare<span className="text-blue-600 dark:text-blue-500">Pro</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggleButton />

            {isPatientLoggedIn && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hi, {patientName}!</span>
                <Link href="/patient/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
                  Dashboard
                </Link>
                <button onClick={() => handleLogout('patient')} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm">
                  Logout
                </button>
              </div>
            )}

            {isHospitalLoggedIn && (
              <div className="flex items-center space-x-3 border-l border-gray-300 dark:border-gray-600 pl-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{hospitalName}</span>
                <Link href="/hospital/dashboard" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold">
                  Dashboard
                </Link>
                <button onClick={() => handleLogout('hospital')} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
