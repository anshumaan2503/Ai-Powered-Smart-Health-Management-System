'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  CogIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  BellIcon,
  LockClosedIcon,
  ServerIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  GlobeAltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import PricingToggle from '@/components/pricing/pricing-toggle'
import FeaturesComparison from '@/components/pricing/features-comparison'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Basic',
      subtitle: 'Perfect for small clinics',
      monthlyPrice: 1999,
      annualPrice: Math.round(1999 * 12 * 0.8), // 20% discount
      description: 'Essential features for small healthcare practices',
      limits: {
        patients: '25 patients/day',
        doctors: '2 doctors',
        storage: '5GB storage'
      },
      features: [
        { name: 'Appointment scheduling', included: true, icon: CalendarDaysIcon },
        { name: 'Basic billing system', included: true, icon: CurrencyRupeeIcon },
        { name: 'Patient records', included: true, icon: UserGroupIcon },
        { name: 'Email support', included: true, icon: EnvelopeIcon },
        { name: 'Mobile app access', included: true, icon: PhoneIcon },
        { name: 'Analytics dashboard', included: false },
        { name: 'WhatsApp notifications', included: false },
        { name: 'Data export', included: false },
        { name: 'Priority support', included: false },
        { name: 'Cloud backup', included: false }
      ],
      popular: false,
      buttonText: 'Start Free Trial',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      name: 'Standard',
      subtitle: 'Best for growing hospitals',
      monthlyPrice: 3999,
      annualPrice: Math.round(3499 * 12 * 0.8), // 20% discount
      description: 'Advanced features for mid-size healthcare facilities',
      limits: {
        patients: '100 patients/day',
        doctors: '10 doctors',
        storage: '50GB storage'
      },
      features: [
        { name: 'Smart appointment scheduler', included: true, icon: CalendarDaysIcon },
        { name: 'Advanced billing system', included: true, icon: CurrencyRupeeIcon },
        { name: 'Analytics dashboard', included: true, icon: ChartBarIcon },
        { name: 'Data export (PDF/Excel)', included: true, icon: DocumentArrowDownIcon },
        { name: 'WhatsApp notifications', included: true, icon: BellIcon },
        { name: 'Priority support', included: true, icon: ChatBubbleLeftRightIcon },
        { name: 'Patient portal', included: true, icon: UserGroupIcon },
        { name: 'Inventory management', included: true, icon: CogIcon },
        { name: 'Cloud backup', included: false },
        { name: '24/7 support', included: false }
      ],
      popular: true,
      buttonText: 'Start Free Trial',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
    },
    {
      name: 'Enterprise',
      subtitle: 'For large hospital networks',
      monthlyPrice: 9999,
      annualPrice: Math.round(9999 * 12 * 0.8), // 20% discount
      description: 'Complete solution for large healthcare organizations',
      limits: {
        patients: 'Unlimited patients',
        doctors: 'Unlimited doctors',
        storage: 'Unlimited storage'
      },
      features: [
        { name: 'All Standard features', included: true, icon: CheckIcon },
        { name: 'Role-based admin control', included: true, icon: LockClosedIcon },
        { name: 'Advanced analytics & reports', included: true, icon: ChartBarIcon },
        { name: 'Cloud data backup', included: true, icon: CloudArrowUpIcon },
        { name: '24/7 phone support', included: true, icon: ClockIcon },
        { name: 'API access', included: true, icon: CogIcon },
        { name: 'Multi-location support', included: true, icon: BuildingOfficeIcon },
        { name: 'Custom integrations', included: true, icon: ServerIcon },
        { name: 'Dedicated account manager', included: true, icon: UserGroupIcon },
        { name: 'SLA guarantee', included: true, icon: ShieldCheckIcon }
      ],
      popular: false,
      buttonText: 'Start Free Trial',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      name: 'Custom',
      subtitle: 'Tailored for your needs',
      monthlyPrice: null,
      annualPrice: null,
      description: 'Fully customized solution for government & enterprise clients',
      limits: {
        patients: 'Unlimited everything',
        doctors: 'Custom configuration',
        storage: 'On-premise or cloud'
      },
      features: [
        { name: 'All Enterprise features', included: true, icon: CheckIcon },
        { name: 'White-label solution', included: true, icon: StarIcon },
        { name: 'On-premise deployment', included: true, icon: ServerIcon },
        { name: 'Custom integrations', included: true, icon: CogIcon },
        { name: 'Dedicated infrastructure', included: true, icon: CloudArrowUpIcon },
        { name: 'Custom training program', included: true, icon: UserGroupIcon },
        { name: 'Compliance certifications', included: true, icon: ShieldCheckIcon },
        { name: 'Migration assistance', included: true, icon: DocumentArrowDownIcon },
        { name: 'Custom SLA terms', included: true, icon: ClockIcon },
        { name: 'Dedicated support team', included: true, icon: ChatBubbleLeftRightIcon }
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white'
    }
  ]

  const getPrice = (plan: any) => {
    if (plan.monthlyPrice === null) return null
    return isAnnual ? plan.annualPrice : plan.monthlyPrice
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Smart Hospital</span>
            </Link>
            <Link href="/hospital/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Choose Your Perfect Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Transform your healthcare practice with our comprehensive hospital management system.
            Start with a 14-day free trial, no credit card required.
          </motion.p>

          {/* Annual/Monthly Toggle */}
          <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="mb-4">
                    {plan.monthlyPrice === null ? (
                      <div className="text-3xl font-bold text-gray-900">Custom Pricing</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900">
                          {formatPrice(getPrice(plan)!)}
                        </div>
                        <div className="text-sm text-gray-600">
                          per {isAnnual ? 'year' : 'month'}
                        </div>
                        {isAnnual && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Save {formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)} annually
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Limits */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Plan Limits</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• {plan.limits.patients}</div>
                    <div>• {plan.limits.doctors}</div>
                    <div>• {plan.limits.storage}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Features included</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${feature.included
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                          }`}>
                          {feature.included ? (
                            <CheckIcon className="h-3 w-3" />
                          ) : (
                            <XMarkIcon className="h-3 w-3" />
                          )}
                        </div>
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>

                {plan.name !== 'Custom' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">Absolutely. We use bank-level encryption and comply with healthcare data protection standards.</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer training?</h3>
              <p className="text-gray-600">Yes, we provide comprehensive training for all plans. Enterprise and Custom plans include dedicated training sessions.</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What about data migration?</h3>
              <p className="text-gray-600">We offer free data migration assistance for Standard plans and above. Our team will help you seamlessly transfer your existing data.</p>
            </div>
          </div>
        </motion.div>

        {/* Features Comparison Table */}
        <FeaturesComparison />

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Healthcare Providers</h2>
            <p className="text-lg text-gray-600">See what our customers say about Smart Hospital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Priya Sharma",
                role: "Chief Medical Officer",
                hospital: "Apollo Hospital, Mumbai",
                content: "Smart Hospital has revolutionized our patient management. The analytics dashboard gives us insights we never had before.",
                rating: 5
              },
              {
                name: "Rajesh Kumar",
                role: "Hospital Administrator",
                hospital: "Fortis Healthcare, Delhi",
                content: "The WhatsApp notifications and automated scheduling have reduced our no-shows by 40%. Excellent ROI!",
                rating: 5
              },
              {
                name: "Dr. Anil Reddy",
                role: "Director",
                hospital: "Narayana Health, Bangalore",
                content: "Implementation was seamless and the support team is outstanding. Our staff productivity has increased significantly.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.hospital}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-20 bg-gray-50 rounded-2xl p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enterprise-Grade Security & Compliance</h2>
            <p className="text-gray-600">Your data is protected with industry-leading security standards</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheckIcon, title: "HIPAA Compliant", desc: "Healthcare data protection" },
              { icon: LockClosedIcon, title: "256-bit Encryption", desc: "Bank-level security" },
              { icon: CloudArrowUpIcon, title: "Daily Backups", desc: "99.9% uptime guarantee" },
              { icon: AcademicCapIcon, title: "ISO 27001", desc: "Information security certified" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>

          <div className="relative z-10">
            <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare Practice?</h2>
            <p className="text-xl mb-8 opacity-90">Join 10,000+ healthcare providers who trust Smart Hospital Management System</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Schedule Demo
              </motion.button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                Setup in 24 hours
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}