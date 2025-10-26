'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  BuildingOffice2Icon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface HospitalSettings {
  // Hospital Information
  name: string
  address: string
  phone: string
  email: string
  website: string
  license_number: string
  established_year: string
  
  // Operating Hours
  operating_hours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  
  // Appointment Settings
  appointment_duration: number
  advance_booking_days: number
  cancellation_hours: number
  
  // Notification Settings
  email_notifications: boolean
  sms_notifications: boolean
  appointment_reminders: boolean
  payment_notifications: boolean
  
  // Security Settings
  password_expiry_days: number
  max_login_attempts: number
  session_timeout_minutes: number
  two_factor_auth: boolean
  
  // Billing Settings
  currency: string
  tax_rate: number
  payment_methods: string[]
  
  // System Settings
  timezone: string
  date_format: string
  time_format: string
  language: string
}

export default function HospitalSettingsPage() {
  const [settings, setSettings] = useState<HospitalSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    license_number: '',
    established_year: '',
    operating_hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '13:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    appointment_duration: 30,
    advance_booking_days: 30,
    cancellation_hours: 24,
    email_notifications: true,
    sms_notifications: true,
    appointment_reminders: true,
    payment_notifications: true,
    password_expiry_days: 90,
    max_login_attempts: 5,
    session_timeout_minutes: 60,
    two_factor_auth: false,
    currency: 'INR',
    tax_rate: 18,
    payment_methods: ['cash', 'card', 'upi'],
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    language: 'en'
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hospital')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const hospitalData = localStorage.getItem('hospital')
      if (hospitalData) {
        const hospital = JSON.parse(hospitalData)
        setSettings(prev => ({
          ...prev,
          name: hospital.name || '',
          address: hospital.address || '',
          phone: hospital.phone || '',
          email: hospital.email || '',
          website: hospital.website || '',
          license_number: hospital.license_number || '',
          established_year: hospital.established_year || ''
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === 'operating_hours') {
      setSettings(prev => ({
        ...prev,
        operating_hours: {
          ...prev.operating_hours,
          [field]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      // Here you would typically save to your backend
      // For now, we'll just save to localStorage
      localStorage.setItem('hospital_settings', JSON.stringify(settings))
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setSaving(true)
      // Here you would call your password change API
      toast.success('Password changed successfully!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'hospital', name: 'Hospital Info', icon: BuildingOffice2Icon },
    { id: 'hours', name: 'Operating Hours', icon: ClockIcon },
    { id: 'appointments', name: 'Appointments', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing', icon: CurrencyDollarIcon },
    { id: 'system', name: 'System', icon: DocumentTextIcon }
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
          Hospital Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your hospital's settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Hospital Information */}
            {activeTab === 'hospital' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BuildingOffice2Icon className="h-5 w-5 text-blue-600 mr-2" />
                  Hospital Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => handleInputChange('', 'name', e.target.value)}
                      className="input-field"
                      placeholder="Enter hospital name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={settings.license_number}
                      onChange={(e) => handleInputChange('', 'license_number', e.target.value)}
                      className="input-field"
                      placeholder="Medical license number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleInputChange('', 'phone', e.target.value)}
                      className="input-field"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleInputChange('', 'email', e.target.value)}
                      className="input-field"
                      placeholder="hospital@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => handleInputChange('', 'website', e.target.value)}
                      className="input-field"
                      placeholder="https://www.hospital.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      value={settings.established_year}
                      onChange={(e) => handleInputChange('', 'established_year', e.target.value)}
                      className="input-field"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => handleInputChange('', 'address', e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Complete hospital address"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Operating Hours */}
            {activeTab === 'hours' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Operating Hours
                </h2>
                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {day}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!settings.operating_hours[day as keyof typeof settings.operating_hours].closed}
                          onChange={(e) => handleInputChange('operating_hours', day, {
                            ...settings.operating_hours[day as keyof typeof settings.operating_hours],
                            closed: !e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>
                      {!settings.operating_hours[day as keyof typeof settings.operating_hours].closed && (
                        <>
                          <input
                            type="time"
                            value={settings.operating_hours[day as keyof typeof settings.operating_hours].open}
                            onChange={(e) => handleInputChange('operating_hours', day, {
                              ...settings.operating_hours[day as keyof typeof settings.operating_hours],
                              open: e.target.value
                            })}
                            className="input-field w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={settings.operating_hours[day as keyof typeof settings.operating_hours].close}
                            onChange={(e) => handleInputChange('operating_hours', day, {
                              ...settings.operating_hours[day as keyof typeof settings.operating_hours],
                              close: e.target.value
                            })}
                            className="input-field w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Appointment Settings */}
            {activeTab === 'appointments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CogIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Appointment Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Appointment Duration (minutes)
                    </label>
                    <select
                      value={settings.appointment_duration}
                      onChange={(e) => handleInputChange('', 'appointment_duration', parseInt(e.target.value))}
                      className="input-field"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking (days)
                    </label>
                    <input
                      type="number"
                      value={settings.advance_booking_days}
                      onChange={(e) => handleInputChange('', 'advance_booking_days', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="365"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.cancellation_hours}
                      onChange={(e) => handleInputChange('', 'cancellation_hours', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Notification Settings
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'appointment_reminders', label: 'Appointment Reminders', desc: 'Send reminders to patients' },
                    { key: 'payment_notifications', label: 'Payment Notifications', desc: 'Notify about payment updates' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof HospitalSettings] as boolean}
                          onChange={(e) => handleInputChange('', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Security Settings
                </h2>
                
                {/* Password Change */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          className="input-field pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="btn-primary"
                      >
                        {saving ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={settings.password_expiry_days}
                      onChange={(e) => handleInputChange('', 'password_expiry_days', parseInt(e.target.value))}
                      className="input-field"
                      min="30"
                      max="365"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.max_login_attempts}
                      onChange={(e) => handleInputChange('', 'max_login_attempts', parseInt(e.target.value))}
                      className="input-field"
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.session_timeout_minutes}
                      onChange={(e) => handleInputChange('', 'session_timeout_minutes', parseInt(e.target.value))}
                      className="input-field"
                      min="15"
                      max="480"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.two_factor_auth}
                        onChange={(e) => handleInputChange('', 'two_factor_auth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Billing Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleInputChange('', 'currency', e.target.value)}
                      className="input-field"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.tax_rate}
                      onChange={(e) => handleInputChange('', 'tax_rate', parseFloat(e.target.value))}
                      className="input-field"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accepted Payment Methods
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['cash', 'card', 'upi', 'netbanking', 'cheque', 'insurance'].map((method) => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.payment_methods.includes(method)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('', 'payment_methods', [...settings.payment_methods, method])
                              } else {
                                handleInputChange('', 'payment_methods', settings.payment_methods.filter(m => m !== method))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                  System Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('', 'timezone', e.target.value)}
                      className="input-field"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.date_format}
                      onChange={(e) => handleInputChange('', 'date_format', e.target.value)}
                      className="input-field"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      value={settings.time_format}
                      onChange={(e) => handleInputChange('', 'time_format', e.target.value)}
                      className="input-field"
                    >
                      <option value="24h">24 Hour</option>
                      <option value="12h">12 Hour (AM/PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleInputChange('', 'language', e.target.value)}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}