'use client'

import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

import {
  BeautifulCard,
  AnimatedIconButton,
  GradientText,
  FeatureList,
  StatsCard,
  GlassButton,
  FloatingActionButton,
  LoadingSpinner
} from '@/components/ui/beautiful-components'

export default function DemoPage() {
  const features = [
    "Advanced AI diagnostics",
    "Real-time patient monitoring", 
    "Secure data encryption",
    "24/7 emergency support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-black mb-6">
              <GradientText gradient="from-blue-600 via-purple-600 to-cyan-600">
                Beautiful UI Components
              </GradientText>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Showcase of modern, beautiful React components with glassmorphism effects, 
              gradients, and smooth animations.
            </p>
          </div>

          {/* Beautiful Cards Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Beautiful Cards
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BeautifulCard gradient="from-blue-400/10 to-purple-600/10">
                <SparklesIcon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
                <p className="text-gray-600">Advanced machine learning for better healthcare outcomes.</p>
              </BeautifulCard>

              <BeautifulCard gradient="from-green-400/10 to-cyan-600/10">
                <ShieldCheckIcon className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Compliant</h3>
                <p className="text-gray-600">HIPAA compliant with enterprise-grade security.</p>
              </BeautifulCard>

              <BeautifulCard gradient="from-purple-400/10 to-pink-600/10">
                <ClockIcon className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Available</h3>
                <p className="text-gray-600">Round-the-clock access and emergency support.</p>
              </BeautifulCard>
            </div>
          </section>

          {/* Animated Icons Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Animated Icon Buttons
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <AnimatedIconButton 
                icon={HeartIcon} 
                label="Healthcare" 
                gradient="from-red-500 to-pink-600"
                size="lg"
              />
              <AnimatedIconButton 
                icon={UserGroupIcon} 
                label="Patients" 
                gradient="from-blue-500 to-blue-600"
                size="lg"
              />
              <AnimatedIconButton 
                icon={ChartBarIcon} 
                label="Analytics" 
                gradient="from-green-500 to-green-600"
                size="lg"
              />
              <AnimatedIconButton 
                icon={SparklesIcon} 
                label="AI Features" 
                gradient="from-purple-500 to-purple-600"
                size="lg"
              />
            </div>
          </section>

          {/* Stats Cards Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Statistics Cards
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatsCard 
                icon={UserGroupIcon}
                value="1,247"
                label="Active Patients"
                gradient="from-blue-600 to-blue-700"
              />
              <StatsCard 
                icon={HeartIcon}
                value="150+"
                label="Partner Hospitals"
                gradient="from-green-600 to-green-700"
              />
              <StatsCard 
                icon={ChartBarIcon}
                value="98.5%"
                label="AI Accuracy"
                gradient="from-purple-600 to-purple-700"
              />
              <StatsCard 
                icon={ClockIcon}
                value="24/7"
                label="Support Available"
                gradient="from-orange-600 to-orange-700"
              />
            </div>
          </section>

          {/* Feature List Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  <GradientText>Advanced Features</GradientText>
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Our platform includes cutting-edge features designed to revolutionize healthcare management.
                </p>
                <FeatureList features={features} iconColor="blue-500" />
              </div>
              <BeautifulCard gradient="from-indigo-400/10 to-purple-600/10">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <HeartIcon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    <GradientText gradient="from-indigo-600 to-purple-600">
                      Healthcare Innovation
                    </GradientText>
                  </h3>
                  <p className="text-gray-600">
                    Experience the future of healthcare with our AI-powered platform.
                  </p>
                </div>
              </BeautifulCard>
            </div>
          </section>

          {/* Buttons Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Glass Buttons
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <GlassButton variant="primary">
                Primary Button
              </GlassButton>
              <GlassButton variant="success">
                Success Button
              </GlassButton>
              <GlassButton variant="danger">
                Danger Button
              </GlassButton>
              <GlassButton variant="secondary">
                Secondary Button
              </GlassButton>
            </div>
          </section>

          {/* Loading States */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Loading Spinners
            </h2>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <LoadingSpinner size="sm" />
                <p className="mt-2 text-gray-600">Small</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="mt-2 text-gray-600">Medium</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Large</p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        icon={PlusIcon}
        gradient="from-blue-500 to-purple-600"
      />
    </div>
  )
}