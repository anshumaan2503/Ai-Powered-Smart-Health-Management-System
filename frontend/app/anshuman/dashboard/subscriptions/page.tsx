'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingOffice2Icon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeData, setUpgradeData] = useState({
    newPlan: '',
    billingCycle: 'monthly',
    effectiveDate: new Date().toISOString().split('T')[0]
  })

  const plans = {
    trial: {
      name: 'Trial',
      monthlyPrice: 0,
      annualPrice: 0,
      features: ['Basic Appointments', 'Limited Records', 'Email Support'],
      limits: { patients: 10, doctors: 1, storage: 1 }
    },
    basic: {
      name: 'Basic',
      monthlyPrice: 2999,
      annualPrice: 28790,
      features: ['Appointments', 'Basic Billing', 'Patient Records', 'Email Support'],
      limits: { patients: 25, doctors: 2, storage: 5 }
    },
    standard: {
      name: 'Standard',
      monthlyPrice: 7499,
      annualPrice: 71990,
      features: ['All Basic', 'Analytics', 'WhatsApp', 'Priority Support', 'Patient Portal'],
      limits: { patients: 100, doctors: 10, storage: 50 }
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 999,
      annualPrice: 9590,
      features: ['All Standard', 'Advanced Analytics', 'Custom Reports', 'API Access'],
      limits: { patients: 200, doctors: 25, storage: 100 }
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 17999,
      annualPrice: 172790,
      features: ['All Premium', 'Custom Integrations', '24/7 Support', 'SLA', 'Dedicated Manager'],
      limits: { patients: -1, doctors: -1, storage: -1 }
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  useEffect(() => {
    filterSubscriptions()
  }, [subscriptions, searchTerm, filterStatus, filterPlan])

  const loadSubscriptions = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch real subscriptions data from backend
      const response = await fetch('http://localhost:5000/api/admin/subscriptions', { headers })

      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      } else {
        console.error('Failed to load subscriptions:', response.status)
        setSubscriptions([])
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const filterSubscriptions = () => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus)
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter(sub => sub.currentPlan === filterPlan)
    }

    setFilteredSubscriptions(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'standard': return 'bg-green-100 text-green-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const handleUpgradeSubscription = (subscription: any) => {
    setSelectedSubscription(subscription)
    setUpgradeData({
      newPlan: subscription.currentPlan,
      billingCycle: subscription.billingCycle,
      effectiveDate: new Date().toISOString().split('T')[0]
    })
    setShowUpgradeModal(true)
  }

  const submitUpgrade = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Call the real API to upgrade subscription
      const response = await fetch(`http://localhost:5000/api/admin/subscriptions/${selectedSubscription.id}/upgrade`, {
        method: 'POST',
        headers,
        body: JSON.stringify(upgradeData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update local state
        const updatedSubscriptions = subscriptions.map(sub => {
          if (sub.id === selectedSubscription.id) {
            const newPlanData = plans[upgradeData.newPlan as keyof typeof plans]
            if (!newPlanData) {
              console.error('Plan not found:', upgradeData.newPlan)
              return sub // Return unchanged if plan not found
            }
            return {
              ...sub,
              currentPlan: upgradeData.newPlan,
              billingCycle: upgradeData.billingCycle,
              monthlyFee: upgradeData.billingCycle === 'annual' 
                ? newPlanData.annualPrice / 12 
                : newPlanData.monthlyPrice,
              limits: newPlanData.limits
            }
          }
          return sub
        })

        setSubscriptions(updatedSubscriptions)
        setShowUpgradeModal(false)
        setSelectedSubscription(null)

        alert(`Successfully updated ${selectedSubscription.hospitalName} to ${upgradeData.newPlan} plan!`)
      } else {
        const error = await response.json()
        alert(`Error updating subscription: ${error.error}`)
      }

    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Error updating subscription. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manually manage hospital subscriptions and billing</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Total: {subscriptions.length} subscriptions
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">
              {filteredSubscriptions.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription, index) => (
          <motion.div
            key={subscription.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Hospital Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-blue-50 mr-3">
                    <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscription.hospitalName}</h3>
                    <p className="text-sm text-gray-600">ID: #{subscription.hospitalId}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.currentPlan)}`}>
                      {subscription.currentPlan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="lg:col-span-1">
                <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monthly Fee:</span>
                    <span className="font-medium">
                      {subscription.monthlyFee > 0 ? formatCurrency(subscription.monthlyFee) : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium capitalize">{subscription.billingCycle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="lg:col-span-1">
                <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
                <div className="space-y-3">
                  {/* Patients */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Patients</span>
                      <span className="font-medium">
                        {subscription.usage.patients} / {subscription.limits.patients === -1 ? '∞' : subscription.limits.patients}
                      </span>
                    </div>
                    {subscription.limits.patients !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getUsagePercentage(subscription.usage.patients, subscription.limits.patients) >= 90 
                              ? 'bg-red-500' 
                              : getUsagePercentage(subscription.usage.patients, subscription.limits.patients) >= 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(subscription.usage.patients, subscription.limits.patients)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Doctors */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Doctors</span>
                      <span className="font-medium">
                        {subscription.usage.doctors} / {subscription.limits.doctors === -1 ? '∞' : subscription.limits.doctors}
                      </span>
                    </div>
                    {subscription.limits.doctors !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getUsagePercentage(subscription.usage.doctors, subscription.limits.doctors) >= 90 
                              ? 'bg-red-500' 
                              : getUsagePercentage(subscription.usage.doctors, subscription.limits.doctors) >= 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(subscription.usage.doctors, subscription.limits.doctors)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Storage</span>
                      <span className="font-medium">
                        {subscription.usage.storage}GB / {subscription.limits.storage === -1 ? '∞' : `${subscription.limits.storage}GB`}
                      </span>
                    </div>
                    {subscription.limits.storage !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(subscription.usage.storage / subscription.limits.storage) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:col-span-1">
                <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => handleUpgradeSubscription(subscription)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modify Plan
                  </button>
                  
                  {subscription.status === 'expired' && (
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Reactivate
                    </button>
                  )}
                  
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Extend Date
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Modify Subscription - {selectedSubscription.hospitalName}
              </h2>
              <p className="text-gray-600 mt-1">Update the subscription plan and billing details</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Plan Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(selectedSubscription.currentPlan)}`}>
                    {selectedSubscription.currentPlan} Plan
                  </span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(selectedSubscription.monthlyFee)}/month
                  </span>
                </div>
              </div>

              {/* New Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select New Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(plans).map(([planKey, plan]) => (
                    <div
                      key={planKey}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        upgradeData.newPlan === planKey
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setUpgradeData(prev => ({ ...prev, newPlan: planKey }))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        {planKey === 'standard' && (
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {formatCurrency(plan.monthlyPrice)}
                        <span className="text-sm text-gray-600">/month</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {plan.features.slice(0, 2).join(', ')}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      upgradeData.billingCycle === 'monthly'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setUpgradeData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  >
                    <h4 className="font-medium text-gray-900">Monthly</h4>
                    <p className="text-sm text-gray-600">Billed every month</p>
                  </div>
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      upgradeData.billingCycle === 'annual'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setUpgradeData(prev => ({ ...prev, billingCycle: 'annual' }))}
                  >
                    <h4 className="font-medium text-gray-900">Annual</h4>
                    <p className="text-sm text-gray-600">Save 20% - Billed yearly</p>
                  </div>
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={upgradeData.effectiveDate}
                  onChange={(e) => setUpgradeData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Price Summary */}
              {upgradeData.newPlan && plans[upgradeData.newPlan as keyof typeof plans] && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>New Plan:</span>
                      <span className="font-medium">{plans[upgradeData.newPlan as keyof typeof plans]?.name || 'Unknown Plan'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Billing Cycle:</span>
                      <span className="font-medium capitalize">{upgradeData.billingCycle}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <span>New Price:</span>
                      <span>
                        {formatCurrency(
                          upgradeData.billingCycle === 'annual'
                            ? (plans[upgradeData.newPlan as keyof typeof plans]?.annualPrice || 0) / 12
                            : plans[upgradeData.newPlan as keyof typeof plans]?.monthlyPrice || 0
                        )}/month
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitUpgrade}
                disabled={!upgradeData.newPlan}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Update Subscription
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}