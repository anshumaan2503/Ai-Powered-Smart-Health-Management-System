'use client'

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
  LockClosedIcon
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
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadHospitals()
  }, [])

  useEffect(() => {
    filterHospitals()
  }, [hospitals, searchTerm, filterStatus, filterPlan])

  const loadHospitals = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch real hospitals data from backend
      const response = await fetch('http://localhost:5000/api/admin/hospitals', { headers })

      if (response.ok) {
        const data = await response.json()
        setHospitals(data.hospitals)
      } else {
        // Fallback to empty array if API fails
        console.error('Failed to load hospitals:', response.status)
        setHospitals([])
      }
    } catch (error) {
      console.error('Error loading hospitals:', error)
      // Fallback to empty array on error
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
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${selectedHospital.id}/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          newPassword,
          confirmPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShowPasswordModal(false)
        setSelectedHospital(null)
        setNewPassword('')
        setConfirmPassword('')
        alert(`Password successfully updated for ${data.hospitalName}`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to change password'}`)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handlePasswordReset = async (hospital: any) => {
    if (!confirm(`Reset password to default (123) for ${hospital.name}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospital.id}/reset-password`, {
        method: 'POST',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Password reset to "${data.newPassword}" for ${data.hospitalName}`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to reset password'}`)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error resetting password. Please try again.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedHospital || deleteConfirmation !== selectedHospital.name) {
      return
    }

    setDeleting(true)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${selectedHospital.id}/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          confirmationName: deleteConfirmation
        })
      })

      if (response.ok) {
        // Remove hospital from local state
        setHospitals(prev => prev.filter(h => h.id !== selectedHospital.id))
        setShowDeleteModal(false)
        setSelectedHospital(null)
        setDeleteConfirmation('')
        
        // Show success message (you could use a toast library)
        alert(`${selectedHospital.name} has been successfully deactivated.`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete hospital'}`)
      }
    } catch (error) {
      console.error('Error deleting hospital:', error)
      alert('Error deleting hospital. Please try again.')
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

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Last login: {new Date(hospital.lastLogin).toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  href={`/anshuman/dashboard/hospitals/${hospital.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </Link>
                
                <Link
                  href={`/anshuman/dashboard/subscriptions?hospital=${hospital.id}`}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Manage Subscription"
                >
                  <CreditCardIcon className="h-4 w-4" />
                </Link>
                
                <Link
                  href={`/anshuman/dashboard/hospitals/${hospital.id}/edit`}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Edit Hospital"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                
                <button
                  onClick={() => handlePasswordClick(hospital)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Change Password"
                >
                  <KeyIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handlePasswordReset(hospital)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Reset Password to 123"
                >
                  <LockClosedIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteClick(hospital)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Hospital"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  deleteConfirmation && !isDeleteConfirmationValid
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
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isDeleteConfirmationValid && !deleting
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

            {/* Additional Warning */}
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
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <KeyIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-gray-600">Update login password for hospital</p>
              </div>
            </div>

            {/* Hospital Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="font-medium text-gray-900">{selectedHospital.name}</div>
                  <div className="text-sm text-gray-600">{selectedHospital.email}</div>
                </div>
              </div>
            </div>

            {/* Password Form */}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    confirmPassword && newPassword !== confirmPassword
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

              {/* Password Requirements */}
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

            {/* Action Buttons */}
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
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && !changingPassword
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

            {/* Quick Reset Option */}
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
    </div>
  )
}