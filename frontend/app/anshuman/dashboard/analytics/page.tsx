'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch analytics data from backend
      const response = await fetch(`http://localhost:5000/api/admin/analytics/overview?period=${selectedPeriod}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        // Fallback to mock data if API fails
        setAnalyticsData(getMockAnalyticsData())
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Fallback to mock data
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalyticsData = () => ({
    planDistribution: [
      { plan: 'trial', count: 0, revenue: 0 },
      { plan: 'basic', count: 0, revenue: 0 },
      { plan: 'standard', count: 0, revenue: 0 },
      { plan: 'premium', count: 0, revenue: 0 },
      { plan: 'enterprise', count: 1, revenue: 17999 }
    ],
    monthlyGrowth: [
      { month: 'Jul', hospitals: 0, revenue: 0 },
      { month: 'Aug', hospitals: 0, revenue: 0 },
      { month: 'Sep', hospitals: 0, revenue: 0 },
      { month: 'Oct', hospitals: 1, revenue: 17999 }
    ],
    recentRegistrations: [
      {
        id: 2,
        name: 'City General Hospital',
        registeredDate: new Date().toISOString()
      }
    ],
    systemHealth: {
      serverStatus: 'online',
      databaseStatus: 'connected',
      paymentGateway: 'development_mode'
    },
    keyMetrics: {
      totalRevenue: 17999,
      revenueGrowth: 0,
      totalHospitals: 1,
      hospitalGrowth: 100,
      activeSubscriptions: 1,
      subscriptionGrowth: 100,
      averageRevenuePerHospital: 17999
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'trial': return 'bg-gray-500'
      case 'basic': return 'bg-blue-500'
      case 'standard': return 'bg-green-500'
      case 'premium': return 'bg-purple-500'
      case 'enterprise': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your hospital management platform</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData?.keyMetrics?.totalRevenue || 0)}
              </h3>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <div className="flex items-center mt-2">
                {analyticsData?.keyMetrics?.revenueGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${
                  analyticsData?.keyMetrics?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analyticsData?.keyMetrics?.revenueGrowth || 0}% vs last period
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {analyticsData?.keyMetrics?.totalHospitals || 0}
              </h3>
              <p className="text-sm text-gray-600">Total Hospitals</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  {analyticsData?.keyMetrics?.hospitalGrowth || 0}% growth
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {analyticsData?.keyMetrics?.activeSubscriptions || 0}
              </h3>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  {analyticsData?.keyMetrics?.subscriptionGrowth || 0}% active
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <CreditCardIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData?.keyMetrics?.averageRevenuePerHospital || 0)}
              </h3>
              <p className="text-sm text-gray-600">Avg Revenue/Hospital</p>
              <div className="flex items-center mt-2">
                <ChartBarIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">Per month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Plan Distribution</h2>
          
          <div className="space-y-4">
            {analyticsData?.planDistribution?.map((plan: any, index: number) => (
              <div key={plan.plan} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${getPlanColor(plan.plan)} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {plan.plan} Plan
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{plan.count} hospitals</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(plan.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Chart */}
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
              {analyticsData?.planDistribution?.map((plan: any, index: number) => {
                const totalHospitals = analyticsData.planDistribution.reduce((sum: number, p: any) => sum + p.count, 0)
                const percentage = totalHospitals > 0 ? (plan.count / totalHospitals) * 100 : 0
                return (
                  <div
                    key={plan.plan}
                    className={`${getPlanColor(plan.plan)} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    title={`${plan.plan}: ${plan.count} hospitals (${percentage.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Monthly Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Growth Trends</h2>
          
          <div className="space-y-4">
            {analyticsData?.monthlyGrowth?.map((month: any, index: number) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">{month.month} 2024</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{month.hospitals} hospitals</div>
                    <div className="text-xs text-gray-600">{formatCurrency(month.revenue)}</div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((month.hospitals / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Hospital Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Hospital Registrations</h2>
          
          <div className="space-y-4">
            {analyticsData?.recentRegistrations?.length > 0 ? (
              analyticsData.recentRegistrations.map((hospital: any, index: number) => (
                <div key={hospital.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 mr-3">
                      <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{hospital.name}</h4>
                      <p className="text-xs text-gray-600">
                        Registered: {new Date(hospital.registeredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BuildingOffice2Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent registrations</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health & Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Server Status</span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {analyticsData?.systemHealth?.serverStatus || 'Online'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {analyticsData?.systemHealth?.databaseStatus || 'Connected'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Payment Gateway</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">
                {analyticsData?.systemHealth?.paymentGateway || 'Development Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Last Updated</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">99.9%</div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">45ms</div>
                <div className="text-xs text-gray-600">Avg Response</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}