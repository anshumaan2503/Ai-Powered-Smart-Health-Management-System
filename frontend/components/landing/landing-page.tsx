import Link from 'next/link'
import { LandingNavbar } from './LandingNavbar'
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
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] relative overflow-hidden transition-colors duration-300 antialiased font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/[0.03] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Navigation - Client Component */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 mb-8">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Healthcare Technology Redefined
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
            AI-Powered <br />
            <span className="text-blue-600 dark:text-blue-500">Healthcare Excellence</span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Comprehensive healthcare management for patients and hospitals.
            <br className="hidden lg:block" />
            Experience <span className="text-blue-600 dark:text-blue-400 font-semibold">intelligent diagnosis</span>,
            <span className="text-green-600 dark:text-green-400 font-semibold"> seamless appointments</span>, and
            <span className="text-purple-600 dark:text-purple-400 font-semibold"> advanced analytics</span>.
          </p>

          <a
            href="#access-section"
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 mb-8"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* AI Chatbot Quick Access */}
          <div className="mt-8 mb-12">
            <Link
              href="/aichatbot"
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Try AI Health Assistant - No Login Required
              <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">1,247</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Active Patients</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent">150+</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Partner Hospitals</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">98.5%</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">AI Accuracy</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section - Patient & Hospital */}
      <section id="access-section" className="py-20 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Experience</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Access powerful healthcare tools tailored for you</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Patient Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-white/30 dark:border-gray-700/30 shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 text-center">
                  For Patients
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                  Access your health records, book appointments, and get AI-powered health insights
                </p>

                <div className="space-y-4 mb-8">
                  {['Book appointments online', 'AI symptom checker', 'Digital health records', 'Prescription management'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200">{feature}</span>
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
                    className="w-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-bold py-4 px-8 rounded-xl transition-all text-center block"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospital Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-white/30 dark:border-gray-700/30 shadow-2xl hover:shadow-green-500/20 transition-all hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-cyan-700 dark:from-green-500 dark:to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HeartIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400 bg-clip-text text-transparent mb-3 text-center">
                  For Hospitals
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                  Complete hospital management system with AI-powered analytics and patient care
                </p>

                <div className="space-y-4 mb-8">
                  {['Patient management system', 'AI diagnosis assistance', 'Staff role management', 'Analytics & reporting'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200">{feature}</span>
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
                    className="w-full border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 font-bold py-4 px-8 rounded-xl transition-all text-center block"
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
          <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-800 group transition-all">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 p-10 lg:p-16">
              <div className="max-w-3xl">
                <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AI Innovation
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  AI Health Assistant
                </h2>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                  Get instant health guidance, symptom analysis, and preparation tips for your doctor visits. Available 24/7 powered by advanced AI.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <SparklesIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Smart Insights</h4>
                      <p className="text-sm text-slate-500">Intelligent health recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Secure Service</h4>
                      <p className="text-sm text-slate-500">Enterprise-grade medical security</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/aichatbot"
                  className="inline-flex items-center px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition-all shadow-xl hover:scale-105"
                >
                  Try AI Chatbot
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">MediCare Pro</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Advanced technology meets compassionate care</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <SparklesIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI-Powered Diagnosis</h3>
              <p className="text-gray-600 dark:text-gray-400">Advanced machine learning algorithms assist healthcare professionals in accurate diagnosis and treatment.</p>
            </div>

            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">HIPAA Compliant</h3>
              <p className="text-gray-600 dark:text-gray-400">Enterprise-grade security ensures your medical data is protected with the highest standards.</p>
            </div>

            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <ClockIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">24/7 Availability</h3>
              <p className="text-gray-600 dark:text-gray-400">Round-the-clock access to your health information and emergency support when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <HeartIcon className="h-8 w-8 text-blue-400 dark:text-blue-300" />
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              MediCare Pro
            </span>
          </div>
          <p className="text-center text-gray-400 dark:text-gray-500 mb-6">
            AI-powered hospital management system for the future of healthcare
          </p>
          <div className="text-center text-gray-500 text-sm">
            © 2026 MediCare Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
