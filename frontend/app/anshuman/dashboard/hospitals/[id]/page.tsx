'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChartBarIcon,
  PencilIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HospitalDetailsPage() {
  const [hospital, setHospital] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const params = useParams()
  const hospitalId = params.id

  useEffect(() => {
    loadHospital()
  }, [hospitalId])

  const loadHospital = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`http://localhost:5000/api/admin/hospitals/${hospitalId}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setHospital(data.hospital)
      } else {
        setError('Failed to load hospital details')
      }
    } catch (error) {
      console.error('Error loading hospital:', error)
      setError('Error loading hospital details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    )
  }

  if (error || !hospital) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Hospital not found</h3>
        <p className="text-gray-600 mb-4">{error || "The hospital you're looking for doesn't exist."}</p>
        <Link href="/anshuman/dashboard/hospitals" className="btn-primary">
          Back to Hospitals
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/anshuman/dashboard/hospitals"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-600">Hospital Details & Management</p>
          </div>
        </div>
        
        <Link
          href={`/anshuman/dashboard/hospitals/${hospital.id}/edit`}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Hospital
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-blue-50 mr-4">
                <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hospital Information</h2>
                <p className="text-gray-600">Basic details and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <p className="text-gray-900 font-medium">{hospital.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{hospital.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{hospital.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {new Date(hospital.registeredDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <p className="text-gray-900">
                    {hospital.lastLogin ? 
                      new Date(hospital.lastLogin).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital ID</label>
                  <p className="text-gray-900 font-mono">#{hospital.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                <p className="text-gray-900">{hospital.address}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hospital Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{hospital.stats?.totalPatients || 0}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{hospital.stats?.totalDoctors || 0}</div>
                <div className="text-sm text-gray-600">Total Doctors</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{hospital.stats?.totalStaff || 0}</div>
                <div className="text-sm text-gray-600">Total Staff</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{hospital.stats?.totalAppointments || 0}</div>
                <div className="text-sm text-gray-600">Appointments</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {hospital.recentActivity && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {hospital.recentActivity.patients?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Patients</h3>
                    <div className="space-y-2">
                      {hospital.recentActivity.patients.slice(0, 5).map((patient: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{patient.full_name}</p>
                            <p className="text-sm text-gray-600">ID: {patient.patient_id}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(patient.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hospital.recentActivity.appointments?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Appointments</h3>
                    <div className="space-y-2">
                      {hospital.recentActivity.appointments.slice(0, 5).map((appointment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                            <p className="text-sm text-gray-600">with {appointment.doctor_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hospital.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                  hospital.subscription?.plan === 'standard' ? 'bg-green-100 text-green-800' :
                  hospital.subscription?.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {hospital.subscription?.plan || 'trial'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hospital.subscription?.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {hospital.subscription?.status || 'inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Fee</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(hospital.subscription?.monthlyFee || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires</span>
                <span className="text-sm text-gray-900">
                  {hospital.subscription?.expiryDate ? 
                    new Date(hospital.subscription.expiryDate).toLocaleDateString() : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            
            <Link
              href={`/anshuman/dashboard/subscriptions?hospital=${hospital.id}`}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                href={`/anshuman/dashboard/hospitals/${hospital.id}/edit`}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Hospital
              </Link>
              
              <Link
                href={`/anshuman/dashboard/subscriptions?hospital=${hospital.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Manage Subscription
              </Link>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(hospital.stats?.monthlyRevenue || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Annual Projection</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency((hospital.stats?.monthlyRevenue || 0) * 12)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}