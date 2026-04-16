'use client'

import { api, adminAPI } from '@/lib/api'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  CreditCardIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FunnelIcon,
  TrashIcon,
  KeyIcon,
  LockClosedIcon,
  ArrowUpIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HospitalsManagementPage() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const [upgradeData, setUpgradeData] = useState({
    newPlan: '',
    billingCycle: 'monthly',
    effectiveDate: new Date().toISOString().split('T')[0]
  })

  // Subscription plan configurations
  const plans = {
    trial: {
      name: 'Trial',
      monthlyPrice: 0,
      annualPrice: 0,
    },
    basic: {
      name: 'Basic',
      monthlyPrice: 2999,
      annualPrice: 28790,
    },
    standard: {
      name: 'Standard',
      monthlyPrice: 7499,
      annualPrice: 71990,
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 12999,
      annualPrice: 124790,
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 17999,
      annualPrice: 172790,
    }
  }

  useEffect(() => {
    loadHospitals()
  }, [])

  useEffect(() => {
    filterHospitals()
  }, [hospitals, searchTerm, filterStatus, filterPlan])

  const loadHospitals = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setHospitals([])
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // ✅ FIXED: use api client (no localhost)
      const response = await api.get('/admin/hospitals', { headers })

      if (response?.data?.hospitals) {
        setHospitals(response.data.hospitals)
      } else {
        console.error('Failed to load hospitals:', response)
        setHospitals([])
      }
    } catch (error) {
      console.error('Error loading hospitals:', error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const filterHospitals = () => {
    let filtered = hospitals

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(hospital => hospital.subscription.status === filterStatus)
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(hospital => hospital.subscription.plan === filterPlan)
    }

    setFilteredHospitals(filtered)
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

  const handleDeleteClick = (hospital: any) => {
    setSelectedHospital(hospital)
    setDeleteConfirmation('')
    setShowDeleteModal(true)
  }

  const handlePasswordClick = (hospital: any) => {
    setSelectedHospital(hospital)
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordModal(true)
  }

  const handleUpgradeClick = (hospital: any) => {
    setSelectedHospital(hospital)
    setUpgradeData({
      newPlan: hospital.subscription.plan,
      billingCycle: 'monthly',
      effectiveDate: new Date().toISOString().split('T')[0]
    })
    setShowUpgradeModal(true)
  }

  const handlePasswordChange = async () => {
    if (!selectedHospital || !newPassword || !confirmPassword) {
      alert('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setChangingPassword(true)

    try {
      const response = await adminAPI.changeHospitalPassword(
        selectedHospital.id,
        newPassword,
        confirmPassword
      )

      setShowPasswordModal(false)
      setSelectedHospital(null)
      setNewPassword('')
      setConfirmPassword('')
      alert(`Password successfully updated for ${response.data.hospitalName}`)
    } catch (error: any) {
      console.error('Error changing password:', error)
      const errorMsg = error.response?.data?.error || 'Failed to change password'
      alert(`Error: ${errorMsg}`)
    } finally {
      setChangingPassword(false)
    }
  }

  const handlePasswordReset = async (hospital: any) => {
    if (!confirm(`Reset password to default (123) for ${hospital.name}?`)) {
      return
    }

    try {
      const response = await adminAPI.resetHospitalPassword(hospital.id)
      alert(`Password reset to "${response.data.newPassword}" for ${response.data.hospitalName}`)
    } catch (error: any) {
      console.error('Error resetting password:', error)
      const errorMsg = error.response?.data?.error || 'Failed to reset password'
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleTogglePayments = async (hospital: any) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await api.put(`/admin/hospitals/${hospital.id}/toggle-payments`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.status === 200) {
        setHospitals(prev => prev.map(h => 
          h.id === hospital.id ? { ...h, payments_enabled: response.data.payments_enabled } : h
        ))
        // Show success alert/toast
        alert(response.data.message)
      }
    } catch (error: any) {
      console.error('Error toggling payments:', error)
      alert('Failed to toggle payments')
    }
  }

  const submitUpgrade = async () => {
    if (!selectedHospital || !upgradeData.newPlan) return

    setUpgrading(true)
    try {
      // ✅ Now using the specialized endpoint that handles both upgrade and creation
      await adminAPI.upgradeHospitalSubscription(selectedHospital.id, upgradeData)
      
      alert(`Successfully updated ${selectedHospital.name} to ${upgradeData.newPlan} plan!`)
      setShowUpgradeModal(false)
      loadHospitals() // Reload to show new plan
    } catch (error: any) {
      console.error('Error upgrading:', error)
      alert(`Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setUpgrading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedHospital || deleteConfirmation !== selectedHospital.name) {
      return
    }

    setDeleting(true)

    try {
      await adminAPI.deleteHospital(selectedHospital.id, deleteConfirmation)

      setHospitals(prev => prev.filter(h => h.id !== selectedHospital.id))
      setShowDeleteModal(false)
      setSelectedHospital(null)
      setDeleteConfirmation('')
      alert(`${selectedHospital.name} has been successfully deactivated.`)
    } catch (error: any) {
      console.error('Error deleting hospital:', error)
      const errorMsg = error.response?.data?.error || 'Failed to delete hospital'
      alert(`Error: ${errorMsg}`)
    } finally {
      setDeleting(false)
    }
  }

  const isDeleteConfirmationValid = deleteConfirmation === selectedHospital?.name

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-600">Manage all registered hospitals and their subscriptions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Total: {hospitals.length} hospitals
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Status Filter */}
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

          {/* Plan Filter */}
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

          {/* Results Count */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {filteredHospitals.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital, index) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            {/* Hospital Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50 mr-4">
                  <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                  <p className="text-sm text-gray-600">ID: #{hospital.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hospital.subscription.status)}`}>
                  {hospital.subscription.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(hospital.subscription.plan)}`}>
                  {hospital.subscription.plan}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${hospital.payments_enabled ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'}`}>
                  {hospital.payments_enabled ? 'Gateway On' : 'Gateway Off'}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {hospital.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {hospital.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {hospital.address}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{hospital.stats.totalPatients}</div>
                <div className="text-xs text-gray-600">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{hospital.stats.totalDoctors}</div>
                <div className="text-xs text-gray-600">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{hospital.stats.totalStaff}</div>
                <div className="text-xs text-gray-600">Staff</div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Subscription</span>
                <span className="text-sm font-semibold text-gray-900">
                  {hospital.subscription.monthlyFee > 0 ? formatCurrency(hospital.subscription.monthlyFee) : 'Free Trial'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Registered: {new Date(hospital.registeredDate).toLocaleDateString()}</span>
                <span>Expires: {new Date(hospital.subscription.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
              <div className="text-xs text-gray-500">
                Last login: {new Date(hospital.lastLogin).toLocaleDateString()}
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/anshuman/dashboard/hospitals/${hospital.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>

                <Link
                  href={`/anshuman/dashboard/hospitals/${hospital.id}/edit`}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                  title="Edit Hospital"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>

                <button
                  onClick={() => handleDeleteClick(hospital)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  title="Delete Hospital"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Prominent Payment Gateway Toggle */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleTogglePayments(hospital)}
                className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-sm ${
                  hospital.payments_enabled 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-50 shadow-indigo-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 ring-4 ring-gray-50 shadow-gray-200'
                }`}
              >
                <CreditCardIcon className={`h-6 w-6 ${hospital.payments_enabled ? 'text-white' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="text-sm font-bold uppercase tracking-wider">
                    Payment Gateway: {hospital.payments_enabled ? 'ENABLED' : 'DISABLED'}
                  </div>
                  <div className={`text-[10px] font-medium opacity-80 ${hospital.payments_enabled ? 'text-indigo-100' : 'text-gray-500'}`}>
                    Click to {hospital.payments_enabled ? 'Turn Off' : 'Turn On'} Razorpay Integration
                  </div>
                </div>
                <div className="flex-1"></div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${hospital.payments_enabled ? 'bg-white/30' : 'bg-gray-300'}`}>
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${hospital.payments_enabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <BuildingOffice2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Hospital</h3>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-red-800 text-sm">
                  <p className="font-medium mb-1">Warning: This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All hospital data and records</li>
                    <li>All associated subscriptions</li>
                    <li>All patient and staff information</li>
                    <li>All appointments and medical records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hospital Info */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to delete <strong>{selectedHospital.name}</strong>.
                This will deactivate the hospital and all its associated data.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Hospital ID:</span>
                    <span className="ml-2 font-mono">#{selectedHospital.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patients:</span>
                    <span className="ml-2 font-semibold">{selectedHospital.stats?.totalPatients || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Doctors:</span>
                    <span className="ml-2 font-semibold">{selectedHospital.stats?.totalDoctors || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Revenue:</span>
                    <span className="ml-2 font-semibold">₹{selectedHospital.stats?.monthlyRevenue || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To confirm deletion, type the hospital name exactly as shown:
              </label>
              <div className="mb-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {selectedHospital.name}
                </code>
              </div>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type hospital name here..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${deleteConfirmation && !isDeleteConfirmationValid
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : isDeleteConfirmationValid
                      ? 'border-green-300 focus:ring-green-500 bg-green-50'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
              />
              {deleteConfirmation && !isDeleteConfirmationValid && (
                <p className="text-red-600 text-xs mt-1">
                  Hospital name doesn't match. Please type exactly: {selectedHospital.name}
                </p>
              )}
              {isDeleteConfirmationValid && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Hospital name confirmed
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedHospital(null)
                  setDeleteConfirmation('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!isDeleteConfirmationValid || deleting}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${isDeleteConfirmationValid && !deleting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Hospital
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                This action is irreversible. Please be absolutely sure.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <KeyIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-gray-600">Update login password for hospital</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="font-medium text-gray-900">{selectedHospital.name}</div>
                  <div className="text-sm text-gray-600">{selectedHospital.email}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : confirmPassword && newPassword === confirmPassword
                        ? 'border-green-300 focus:ring-green-500 bg-green-50'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-1">Password Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                      At least 6 characters long
                    </li>
                    <li className={newPassword === confirmPassword && newPassword ? 'text-green-600' : ''}>
                      Passwords must match
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedHospital(null)
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || changingPassword}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && !changingPassword
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Or reset to default password:
                </p>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    handlePasswordReset(selectedHospital)
                  }}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Reset to "123"
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Modify Subscription - {selectedHospital.name}
              </h2>
              <p className="text-gray-600 mt-1">Update the subscription plan and billing details</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Plan Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(selectedHospital.subscription.plan)}`}>
                    {selectedHospital.subscription.plan}
                  </span>
                  <span className="text-sm text-gray-600">
                    Expires: {new Date(selectedHospital.subscription.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Select New Plan */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Select New Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(plans).map(([key, plan]) => (
                    <div
                      key={key}
                      onClick={() => setUpgradeData({ ...upgradeData, newPlan: key })}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${upgradeData.newPlan === key
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 capitalize">{plan.name}</span>
                        {upgradeData.newPlan === key && (
                          <CheckCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {upgradeData.billingCycle === 'monthly'
                          ? formatCurrency(plan.monthlyPrice)
                          : formatCurrency(plan.annualPrice / 12)}
                        <span className="text-sm font-normal text-gray-500"> / month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Billing Cycle</h3>
                <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-sm">
                  <button
                    onClick={() => setUpgradeData({ ...upgradeData, billingCycle: 'monthly' })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${upgradeData.billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setUpgradeData({ ...upgradeData, billingCycle: 'annual' })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${upgradeData.billingCycle === 'annual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Annual
                    <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase">
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={upgrading}
              >
                Cancel
              </button>
              <button
                onClick={submitUpgrade}
                disabled={!upgradeData.newPlan || upgrading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {upgrading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Upgrading...
                   </>
                ) : (
                  'Update Subscription'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}