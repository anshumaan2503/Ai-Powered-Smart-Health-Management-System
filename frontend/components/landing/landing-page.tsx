'use client'

import Link from 'next/link'
import { useRef } from 'react'
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
  const loginSectionsRef = useRef<HTMLDivElement>(null);

  const scrollToLoginSections = () => {
    console.log('Scrolling to login sections...');
    if (loginSectionsRef.current) {
      // Try smooth scroll first
      try {
        loginSectionsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } catch (error) {
        // Fallback for older browsers
        const elementTop = loginSectionsRef.current.offsetTop - 80; // Account for nav
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center group">
              <div className="relative">
                <HeartIcon className="h-9 w-9 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-lg group-hover:bg-blue-700/30 transition-all duration-300"></div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediCare Pro
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:scale-105 relative group"
              >
                Patient Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/hospital/login" 
                className="text-gray-700 hover:text-green-600 font-semibold transition-all duration-300 hover:scale-105 relative group"
              >
                Hospital Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/hospital/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-8 border border-blue-200/50">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Next-Generation Healthcare Technology
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                Healthcare Platform
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium mb-12">
              Comprehensive healthcare management for patients and hospitals. 
              <br className="hidden lg:block" />
              Experience <span className="text-blue-600 font-semibold">intelligent diagnosis</span>, 
              <span className="text-green-600 font-semibold"> seamless appointments</span>, and 
              <span className="text-purple-600 font-semibold"> advanced analytics</span>.
            </p>
            
            {/* Get Started Button */}
            <div className="flex flex-col items-center">
              <button 
                onClick={scrollToLoginSections}
                className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-500 ease-in-out transform hover:scale-110 hover:-translate-y-1 active:scale-105 mb-8 cursor-pointer"
              >
                {/* Button Background with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl transition-all duration-500 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-cyan-700"></div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                
                {/* Button Content */}
                <span className="relative flex items-center">
                  Get Started
                  <svg 
                    className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </button>
              
              {/* Scroll Indicator */}
              <div className="flex flex-col items-center animate-bounce opacity-60">
                <span className="text-sm text-gray-500 mb-2 font-medium">Choose your path</span>
                <svg 
                  className="w-6 h-6 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Two-Section Layout */}
          <div ref={loginSectionsRef} id="login-sections" className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto scroll-mt-20">
            {/* Patient Section */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center mb-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
                      <UserGroupIcon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    For Patients
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Access your health records, book appointments, and get AI-powered health insights
                  </p>
                </div>

                <div className="space-y-5 mb-10">
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Book appointments online</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">AI symptom checker</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Digital health records</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Prescription management</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link 
                    href="/login" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center group/btn hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Patient Login
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link 
                    href="/register" 
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-center block hover:scale-105 hover:shadow-lg"
                  >
                    Create Patient Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospital Section */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center mb-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-600 to-cyan-700 rounded-2xl flex items-center justify-center">
                      <HeartIcon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    For Hospitals
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Complete hospital management system with AI-powered analytics and patient care
                  </p>
                </div>

                <div className="space-y-5 mb-10">
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Patient management system</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">AI diagnosis assistance</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Staff role management</span>
                  </div>
                  <div className="flex items-center space-x-4 group/item">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Analytics & reporting</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link 
                    href="/hospital/login" 
                    className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center group/btn hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    Hospital Login
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link 
                    href="/hospital/register" 
                    className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-center block hover:scale-105 hover:shadow-lg"
                  >
                    Register Hospital
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">1,247</div>
              <div className="text-gray-600 font-semibold">Active Patients</div>
            </div>
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">150+</div>
              <div className="text-gray-600 font-semibold">Partner Hospitals</div>
            </div>
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">98.5%</div>
              <div className="text-gray-600 font-semibold">AI Accuracy</div>
            </div>
            <div className="text-center group">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-600 font-semibold">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> MediCare Pro</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets compassionate care in our comprehensive healthcare platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Diagnosis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced machine learning algorithms assist healthcare professionals in accurate diagnosis and treatment recommendations.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-cyan-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">HIPAA Compliant</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security ensures your medical data is protected with the highest standards of privacy and compliance.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Availability</h3>
                <p className="text-gray-600 leading-relaxed">
                  Round-the-clock access to your health information and emergency support when you need it most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">
              Ready to 
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent"> Transform</span>
              <br />Healthcare?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Whether you're a patient seeking better healthcare or a hospital looking to modernize operations, 
              <br className="hidden lg:block" />
              we have the perfect solution for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Patient CTA */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-700 rounded-2xl flex items-center justify-center">
                      <UserGroupIcon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6">For Patients</h3>
                  <p className="text-white/90 mb-8 text-lg leading-relaxed">
                    Take control of your health with our comprehensive patient portal
                  </p>
                  <div className="space-y-4">
                    <Link 
                      href="/login" 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 block hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      Patient Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="w-full border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 block hover:scale-105"
                    >
                      Sign Up as Patient
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital CTA */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center">
                      <HeartIcon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6">For Hospitals</h3>
                  <p className="text-white/90 mb-8 text-lg leading-relaxed">
                    Transform your healthcare facility with AI-powered management
                  </p>
                  <div className="space-y-4">
                    <Link 
                      href="/hospital/login" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 block hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                    >
                      Hospital Login
                    </Link>
                    <Link 
                      href="/hospital/register" 
                      className="w-full border-2 border-white/50 text-white hover:bg-white hover:text-green-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 block hover:scale-105"
                    >
                      Register Hospital
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6 group">
                <div className="relative">
                  <HeartIcon className="h-10 w-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg group-hover:bg-blue-300/30 transition-all duration-300"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MediCare Pro
                </span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                AI-powered hospital management system for the future of healthcare. 
                Transforming patient care through innovative technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-white font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-white font-bold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 MediCare Pro. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">HIPAA Compliance</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}