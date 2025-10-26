'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  BellIcon,
  LockClosedIcon,
  ServerIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  CogIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [hospitalData, setHospitalData] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState(true)

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Perfect for small clinics',
      monthlyPrice: 1999,
      annualPrice: Math.round(1999 * 12 * 0.8),
      description: 'Essential features for small healthcare practices',
      limits: {
        patients: 25,
        doctors: 2,
        storage: 5
      },
      features: [
        { name: 'Appointment scheduling', included: true },
        { name: 'Basic billing system', included: true },
        { name: 'Patient records', included: true },
        { name: 'Email support', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Analytics dashboard', included: false },
        { name: 'WhatsApp notifications', included: false },
        { name: 'Data export', included: false },
        { name: 'Priority support', included: false },
        { name: 'Cloud backup', included: false }
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      subtitle: 'Best for growing hospitals',
      monthlyPrice: 3999,
      annualPrice: Math.round(3999 * 12 * 0.8),
      description: 'Advanced features for mid-size healthcare facilities',
      limits: {
        patients: 100,
        doctors: 10,
        storage: 50
      },
      features: [
        { name: 'Smart appointment scheduler', included: true },
        { name: 'Advanced billing system', included: true },
        { name: 'Analytics dashboard', included: true },
        { name: 'Data export (PDF/Excel)', included: true },
        { name: 'WhatsApp notifications', included: true },
        { name: 'Priority support', included: true },
        { name: 'Patient portal', included: true },
        { name: 'Inventory management', included: true },
        { name: 'Cloud backup', included: false },
        { name: '24/7 support', included: false }
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'For large hospital networks',
      monthlyPrice: 9999,
      annualPrice: Math.round(9999 * 12 * 0.8),
      description: 'Complete solution for large healthcare organizations',
      limits: {
        patients: -1, // Unlimited
        doctors: -1,
        storage: -1
      },
      features: [
        { name: 'All Standard features', included: true },
        { name: 'Role-based admin control', included: true },
        { name: 'Advanced analytics & reports', included: true },
        { name: 'Cloud data backup', included: true },
        { name: '24/7 phone support', included: true },
        { name: 'API access', included: true },
        { name: 'Multi-location support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'SLA guarantee', included: true }
      ]
    }
  ]

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      // Load from localStorage first
      const hospital = localStorage.getItem('hospital')
      const subscription = localStorage.getItem('subscription')
      
      if (hospital) setHospitalData(JSON.parse(hospital))
      if (subscription) setCurrentSubscription(JSON.parse(subscription))

      // Load usage statistics
      const token = localStorage.getItem('hospital_access_token')
      if (token) {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Get usage stats from backend
        const [patientsRes, doctorsRes, staffRes] = await Promise.all([
          fetch('http://localhost:5000/api/hospital/patients?per_page=1', { headers }),
          fetch('http://localhost:5000/api/hospital/staff?role=doctor', { headers }),
          fetch('http://localhost:5000/api/hospital/staff', { headers })
        ])

        const usage = {
          patients: 0,
          doctors: 0,
          staff: 0
        }

        if (patientsRes.ok) {
          const patientsData = await patientsRes.json()
          usage.patients = patientsData.total || 0
        }

        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json()
          usage.doctors = doctorsData.staff?.length || 0
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json()
          usage.staff = staffData.staff?.length || 0
        }

        setUsageStats(usage)
      }

    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getCurrentPlan = () => {
    if (!currentSubscription) return plans[0] // Default to Basic
    return plans.find(plan => plan.id === currentSubscription.plan_name) || plans[0]
  }

  const handleUpgrade = (planId: string) => {
    // In a real app, this would integrate with payment gateway
    alert(`Upgrade to ${planId} plan - Payment integration would be implemented here`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-blue-100 text-lg">
          Manage your hospital's subscription plan and billing
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            {currentPlan.popular && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <StarIcon className="h-4 w-4 mr-1" />
                Most Popular
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h3>
              <p className="text-gray-600">{currentPlan.subtitle}</p>
              <div className="mt-2">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(currentPlan.monthlyPrice)}
                </span>
                <span className="text-gray-600 ml-2">per month</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Next billing date</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Usage Statistics</h4>
            
            {usageStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Patients Usage */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Patients</span>
                    <span className="text-sm text-gray-600">
                      {usageStats.patients} / {currentPlan.limits.patients === -1 ? '∞' : currentPlan.limits.patients}
                    </span>
                  </div>
                  {currentPlan.limits.patients !== -1 && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getUsagePercentage(usageStats.patients, currentPlan.limits.patients) >= 90 
                              ? 'bg-red-500' 
                              : getUsagePercentage(usageStats.patients, currentPlan.limits.patients) >= 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usageStats.patients, currentPlan.limits.patients)}%` }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getUsageColor(getUsagePercentage(usageStats.patients, currentPlan.limits.patients))
                      }`}>
                        {getUsagePercentage(usageStats.patients, currentPlan.limits.patients).toFixed(0)}% used
                      </span>
                    </>
                  )}
                </div>

                {/* Doctors Usage */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Doctors</span>
                    <span className="text-sm text-gray-600">
                      {usageStats.doctors} / {currentPlan.limits.doctors === -1 ? '∞' : currentPlan.limits.doctors}
                    </span>
                  </div>
                  {currentPlan.limits.doctors !== -1 && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors) >= 90 
                              ? 'bg-red-500' 
                              : getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors) >= 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors)}%` }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getUsageColor(getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors))
                      }`}>
                        {getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors).toFixed(0)}% used
                      </span>
                    </>
                  )}
                </div>

                {/* Storage Usage */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage</span>
                    <span className="text-sm text-gray-600">
                      2.3GB / {currentPlan.limits.storage === -1 ? '∞' : `${currentPlan.limits.storage}GB`}
                    </span>
                  </div>
                  {currentPlan.limits.storage !== -1 && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(2.3 / currentPlan.limits.storage) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full text-blue-600 bg-blue-100">
                        {((2.3 / currentPlan.limits.storage) * 100).toFixed(0)}% used
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Usage Warnings */}
          {usageStats && currentPlan.limits.patients !== -1 && (
            <>
              {getUsagePercentage(usageStats.patients, currentPlan.limits.patients) >= 90 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Patient limit almost reached! Consider upgrading your plan.
                    </span>
                  </div>
                </div>
              )}
              {getUsagePercentage(usageStats.doctors, currentPlan.limits.doctors) >= 90 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Doctor limit almost reached! Consider upgrading your plan.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Billing Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="text-sm font-medium text-gray-900">{currentPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <span className="text-sm font-medium text-gray-900">{formatPrice(currentPlan.monthlyPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Billing Cycle</span>
                <span className="text-sm font-medium text-gray-900">Monthly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/pricing"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
              >
                <ArrowUpIcon className="h-4 w-4 inline mr-2" />
                Upgrade Plan
              </Link>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                <CreditCardIcon className="h-4 w-4 inline mr-2" />
                Update Payment Method
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Plans</h2>
          <p className="text-gray-600">Choose the plan that best fits your hospital's needs</p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center mt-6">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`mx-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan.id
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-xl border-2 p-6 ${
                  isCurrentPlan 
                    ? 'border-blue-500 bg-blue-50' 
                    : plan.popular 
                      ? 'border-purple-200 shadow-lg' 
                      : 'border-gray-200'
                } hover:shadow-lg transition-all`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {isAnnual ? 'year' : 'month'}
                    </div>
                    {isAnnual && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Save {formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)} annually
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Limits */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Plan Limits</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• {plan.limits.patients === -1 ? 'Unlimited' : plan.limits.patients} patients/day</div>
                    <div>• {plan.limits.doctors === -1 ? 'Unlimited' : plan.limits.doctors} doctors</div>
                    <div>• {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`} storage</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mr-3 ${
                          feature.included 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {feature.included ? (
                            <CheckIcon className="h-3 w-3" />
                          ) : (
                            <XMarkIcon className="h-3 w-3" />
                          )}
                        </div>
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-gray-500 ml-7">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                        : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { date: '2024-01-01', plan: 'Standard', amount: 7499, status: 'Paid' },
                { date: '2023-12-01', plan: 'Standard', amount: 7499, status: 'Paid' },
                { date: '2023-11-01', plan: 'Basic', amount: 2999, status: 'Paid' },
              ].map((invoice, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <button className="hover:text-blue-800">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}