'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import {
  HeartIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const accessSectionRef = useRef<HTMLDivElement>(null);
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
      // Redirect patient to dashboard
      window.location.href = '/patient/dashboard';
      return;
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
      // Redirect hospital to dashboard
      window.location.href = '/hospital/dashboard';
      return;
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
    window.location.reload();
  };

  const scrollToAccess = () => {
    accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <HeartIcon className="h-9 w-9 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediCare Pro
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {isPatientLoggedIn && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Hi, {patientName}!</span>
                  <Link href="/patient/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Dashboard
                  </Link>
                  <button onClick={() => handleLogout('patient')} className="text-gray-500 hover:text-red-600 text-sm">
                    Logout
                  </button>
                </div>
              )}

              {isHospitalLoggedIn && (
                <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                  <span className="text-sm text-gray-600">{hospitalName}</span>
                  <Link href="/hospital/dashboard" className="text-green-600 hover:text-green-700 font-semibold">
                    Dashboard
                  </Link>
                  <button onClick={() => handleLogout('hospital')} className="text-gray-500 hover:text-red-600 text-sm">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-8">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Next-Generation Healthcare Technology
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Healthcare Platform
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
            Comprehensive healthcare management for patients and hospitals.
            <br className="hidden lg:block" />
            Experience <span className="text-blue-600 font-semibold">intelligent diagnosis</span>,
            <span className="text-green-600 font-semibold"> seamless appointments</span>, and
            <span className="text-purple-600 font-semibold"> advanced analytics</span>.
          </p>

          <button
            onClick={scrollToAccess}
            className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-300 hover:scale-105 cursor-pointer mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <span className="relative flex items-center">
              Get Started
              <ArrowRightIcon className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">1,247</div>
              <div className="text-gray-600 font-semibold">Active Patients</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">150+</div>
              <div className="text-gray-600 font-semibold">Partner Hospitals</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">98.5%</div>
              <div className="text-gray-600 font-semibold">AI Accuracy</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-600 font-semibold">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section - Patient & Hospital */}
      <section ref={accessSectionRef} className="py-20 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Experience</span>
            </h2>
            <p className="text-xl text-gray-600">Access powerful healthcare tools tailored for you</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Patient Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 text-center">
                  For Patients
                </h3>
                <p className="text-gray-600 text-center mb-8">
                  Access your health records, book appointments, and get AI-powered health insights
                </p>

                <div className="space-y-4 mb-8">
                  {['Book appointments online', 'AI symptom checker', 'Digital health records', 'Prescription management'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center group/btn hover:scale-105"
                  >
                    Login
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all text-center block"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospital Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl hover:shadow-green-500/20 transition-all hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HeartIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent mb-3 text-center">
                  For Hospitals
                </h3>
                <p className="text-gray-600 text-center mb-8">
                  Complete hospital management system with AI-powered analytics and patient care
                </p>

                <div className="space-y-4 mb-8">
                  {['Patient management system', 'AI diagnosis assistance', 'Staff role management', 'Analytics & reporting'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Link
                    href="/hospital/login"
                    className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center group/btn hover:scale-105"
                  >
                    Login
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/hospital/register"
                    className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-4 px-8 rounded-xl transition-all text-center block"
                  >
                    Register Hospital
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Health Assistant Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 text-white overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                    <SparklesIcon className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black mb-4">
                    AI Health Assistant
                  </h2>
                  <p className="text-xl text-white/90 max-w-3xl mx-auto">
                    Get instant health guidance, symptom analysis, and preparation tips for your doctor visits. Available 24/7 with advanced GROQ AI technology.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <SparklesIcon className="h-8 w-8 text-white mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-2">AI-Powered Insights</h3>
                    <p className="text-white/80 text-sm">Intelligent health recommendations based on your symptoms</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <ShieldCheckIcon className="h-8 w-8 text-white mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-2">Safe & Secure</h3>
                    <p className="text-white/80 text-sm">HIPAA compliant with enterprise-grade security</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <ClockIcon className="h-8 w-8 text-white mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-2">Always Available</h3>
                    <p className="text-white/80 text-sm">Access health assistance anytime, anywhere</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-white/90 mb-6 text-sm">
                    <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                    Login required to access AI Health Assistant
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                      href="/login"
                      className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all flex items-center group/btn hover:scale-105 shadow-xl"
                    >
                      Try AI Chatbot
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediCare Pro</span>
            </h2>
            <p className="text-xl text-gray-600">Advanced technology meets compassionate care</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <SparklesIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Diagnosis</h3>
              <p className="text-gray-600">Advanced machine learning algorithms assist healthcare professionals in accurate diagnosis and treatment.</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">HIPAA Compliant</h3>
              <p className="text-gray-600">Enterprise-grade security ensures your medical data is protected with the highest standards.</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <ClockIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Availability</h3>
              <p className="text-gray-600">Round-the-clock access to your health information and emergency support when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <HeartIcon className="h-8 w-8 text-blue-400" />
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MediCare Pro
            </span>
          </div>
          <p className="text-center text-gray-400 mb-6">
            AI-powered hospital management system for the future of healthcare
          </p>
          <div className="text-center text-gray-500 text-sm">
            © 2025 MediCare Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
