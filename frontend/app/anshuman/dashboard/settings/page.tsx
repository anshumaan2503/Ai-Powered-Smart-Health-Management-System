'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { hospitalSettingsSchema, useFormValidation, ValidationErrors } from '@/lib/validation'

interface AdminSettings {
  // System Configuration
  system_name: string
  system_version: string
  maintenance_mode: boolean
  debug_mode: boolean
  
  // Default Hospital Settings Template
  default_hospital_settings: {
    appointment_duration: number
    advance_booking_days: number
    cancellation_hours: number
    currency: string
    tax_rate: number
    timezone: string
    date_format: string
    time_format: string
    language: string
  }
  
  // Security Policies
  global_security: {
    password_expiry_days: number
    max_login_attempts: number
    session_timeout_minutes: number
    require_two_factor: boolean
    password_min_length: number
    password_require_special: boolean
  }
  
  // Notification Settings
  global_notifications: {
    email_enabled: boolean
    sms_enabled: boolean
    smtp_host: string
    smtp_port: number
    smtp_username: string
    smtp_password: string
    sms_provider: string
    sms_api_key: string
  }
  
  // Backup Settings
  backup_config: {
    auto_backup: boolean
    backup_frequency: 'daily' | 'weekly' | 'monthly'
    retention_days: number
    backup_location: string
  }
  
  // Audit Settings
  audit_config: {
    enable_audit_log: boolean
    log_retention_days: number
    log_sensitive_data: boolean
    alert_on_critical_changes: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    system_name: 'Smart Hospital Management System',
    system_version: '1.0.0',
    maintenance_mode: false,
    debug_mode: false,
    default_hospital_settings: {
      appointment_duration: 30,
      advance_booking_days: 30,
      cancellation_hours: 24,
      currency: 'INR',
      tax_rate: 18,
      timezone: 'Asia/Kolkata',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      language: 'en'
    },
    global_security: {
      password_expiry_days: 90,
      max_login_attempts: 5,
      session_timeout_minutes: 60,
      require_two_factor: false,
      password_min_length: 8,
      password_require_special: true
    },
    global_notifications: {
      email_enabled: true,
      sms_enabled: true,
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      sms_provider: 'twilio',
      sms_api_key: ''
    },
    backup_config: {
      auto_backup: true,
      backup_frequency: 'daily',
      retention_days: 30,
      backup_location: '/backups'
    },
    audit_config: {
      enable_audit_log: true,
      log_retention_days: 365,
      log_sensitive_data: false,
      alert_on_critical_changes: true
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('system')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // Load admin settings from API
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading admin settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (section: string, field: string, value: any): string | null => {
    // Basic validation for admin settings
    if (field === 'system_name' && (!value || value.trim().length === 0)) {
      return 'System name is required'
    }
    
    if (field === 'smtp_port' && (isNaN(value) || value < 1 || value > 65535)) {
      return 'Please enter a valid port number (1-65535)'
    }
    
    if (field === 'password_min_length' && (isNaN(value) || value < 6 || value > 50)) {
      return 'Password length must be between 6 and 50 characters'
    }
    
    if (field === 'retention_days' && (isNaN(value) || value < 1 || value > 3650)) {
      return 'Retention days must be between 1 and 3650'
    }
    
    return null
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === '') {
      // Handle top-level fields
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      // Handle nested fields
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof AdminSettings] as any),
          [field]: value
        }
      }))
    }
    
    // Validate the field
    const error = validateField(section, field, value)
    const errorKey = section ? `${section}.${field}` : field
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[errorKey] = error
      } else {
        delete newErrors[errorKey]
      }
      return newErrors
    })
    
    setIsDirty(true)
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // Validate all settings before saving
      const hasErrors = Object.values(errors).some(error => error)
      if (hasErrors) {
        toast.error('Please fix validation errors before saving')
        return
      }
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('Settings saved successfully!')
        setIsDirty(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleExportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Settings exported successfully!')
    } catch (error) {
      console.error('Error exporting settings:', error)
      toast.error('Failed to export settings')
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      
      // Basic validation of imported settings
      if (!importedSettings.system_name || !importedSettings.system_version) {
        toast.error('Invalid settings file format')
        return
      }
      
      setSettings(importedSettings)
      setIsDirty(true)
      toast.success('Settings imported successfully!')
    } catch (error) {
      console.error('Error importing settings:', error)
      toast.error('Failed to import settings - invalid file format')
    }
  }

  const tabs = [
    { id: 'system', name: 'System Config', icon: CogIcon },
    { id: 'defaults', name: 'Default Settings', icon: BuildingOffice2Icon },
    { id: 'security', name: 'Security Policies', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'backup', name: 'Backup & Restore', icon: DocumentTextIcon },
    { id: 'audit', name: 'Audit & Logging', icon: ClipboardDocumentListIcon }
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CogIcon className="h-8 w-8 text-red-600 mr-3" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure global system settings and policies
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isDirty && (
            <div className="flex items-center text-amber-600 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            id="import-settings"
          />
          <label
            htmlFor="import-settings"
            className="btn-secondary flex items-center cursor-pointer"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Import
          </label>
          
          <button
            onClick={handleExportSettings}
            className="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving || !isDirty}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckCircleIcon className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
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
                    ? 'bg-red-100 text-red-700'
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
            
            {/* System Configuration */}
            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CogIcon className="h-5 w-5 text-red-600 mr-2" />
                  System Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Name *
                    </label>
                    <input
                      type="text"
                      value={settings.system_name}
                      onChange={(e) => handleInputChange('', 'system_name', e.target.value)}
                      className={`input-field ${errors['system_name'] ? 'border-red-500' : ''}`}
                      placeholder="Enter system name"
                    />
                    {errors['system_name'] && typeof errors['system_name'] === 'string' && (
                      <p className="text-red-500 text-sm mt-1">{errors['system_name']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Version
                    </label>
                    <input
                      type="text"
                      value={settings.system_version}
                      onChange={(e) => handleInputChange('', 'system_version', e.target.value)}
                      className="input-field"
                      placeholder="1.0.0"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-500">Temporarily disable system access for maintenance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode}
                          onChange={(e) => handleInputChange('', 'maintenance_mode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
                        <p className="text-sm text-gray-500">Enable detailed logging and error reporting</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.debug_mode}
                          onChange={(e) => handleInputChange('', 'debug_mode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Default Hospital Settings */}
            {activeTab === 'defaults' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BuildingOffice2Icon className="h-5 w-5 text-red-600 mr-2" />
                  Default Hospital Settings Template
                </h2>
                <p className="text-gray-600 mb-6">
                  These settings will be applied to new hospitals when they register
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Appointment Duration (minutes)
                    </label>
                    <select
                      value={settings.default_hospital_settings.appointment_duration}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'appointment_duration', parseInt(e.target.value))}
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
                      value={settings.default_hospital_settings.advance_booking_days}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'advance_booking_days', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={settings.default_hospital_settings.currency}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'currency', e.target.value)}
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
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.default_hospital_settings.tax_rate}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'tax_rate', parseFloat(e.target.value))}
                      className="input-field"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Timezone
                    </label>
                    <select
                      value={settings.default_hospital_settings.timezone}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'timezone', e.target.value)}
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
                      value={settings.default_hospital_settings.date_format}
                      onChange={(e) => handleInputChange('default_hospital_settings', 'date_format', e.target.value)}
                      className="input-field"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Policies */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-red-600 mr-2" />
                  Global Security Policies
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={settings.global_security.password_expiry_days}
                      onChange={(e) => handleInputChange('global_security', 'password_expiry_days', parseInt(e.target.value))}
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
                      value={settings.global_security.max_login_attempts}
                      onChange={(e) => handleInputChange('global_security', 'max_login_attempts', parseInt(e.target.value))}
                      className={`input-field ${errors['global_security.max_login_attempts'] ? 'border-red-500' : ''}`}
                      min="3"
                      max="10"
                    />
                    {errors['global_security.max_login_attempts'] && typeof errors['global_security.max_login_attempts'] === 'string' && (
                      <p className="text-red-500 text-sm mt-1">{errors['global_security.max_login_attempts']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.global_security.session_timeout_minutes}
                      onChange={(e) => handleInputChange('global_security', 'session_timeout_minutes', parseInt(e.target.value))}
                      className="input-field"
                      min="15"
                      max="480"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={settings.global_security.password_min_length}
                      onChange={(e) => handleInputChange('global_security', 'password_min_length', parseInt(e.target.value))}
                      className={`input-field ${errors['global_security.password_min_length'] ? 'border-red-500' : ''}`}
                      min="6"
                      max="50"
                    />
                    {errors['global_security.password_min_length'] && typeof errors['global_security.password_min_length'] === 'string' && (
                      <p className="text-red-500 text-sm mt-1">{errors['global_security.password_min_length']}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.global_security.require_two_factor}
                          onChange={(e) => handleInputChange('global_security', 'require_two_factor', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Require Special Characters</h3>
                        <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.global_security.password_require_special}
                          onChange={(e) => handleInputChange('global_security', 'password_require_special', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
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
                  <BellIcon className="h-5 w-5 text-red-600 mr-2" />
                  Global Notification Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Email Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Email Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.global_notifications.email_enabled}
                              onChange={(e) => handleInputChange('global_notifications', 'email_enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settings.global_notifications.smtp_host}
                          onChange={(e) => handleInputChange('global_notifications', 'smtp_host', e.target.value)}
                          className="input-field"
                          placeholder="smtp.gmail.com"
                          disabled={!settings.global_notifications.email_enabled}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.global_notifications.smtp_port}
                          onChange={(e) => handleInputChange('global_notifications', 'smtp_port', parseInt(e.target.value))}
                          className={`input-field ${errors['global_notifications.smtp_port'] ? 'border-red-500' : ''}`}
                          placeholder="587"
                          disabled={!settings.global_notifications.email_enabled}
                        />
                        {errors['global_notifications.smtp_port'] && typeof errors['global_notifications.smtp_port'] === 'string' && (
                          <p className="text-red-500 text-sm mt-1">{errors['global_notifications.smtp_port']}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          value={settings.global_notifications.smtp_username}
                          onChange={(e) => handleInputChange('global_notifications', 'smtp_username', e.target.value)}
                          className="input-field"
                          placeholder="your-email@gmail.com"
                          disabled={!settings.global_notifications.email_enabled}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          value={settings.global_notifications.smtp_password}
                          onChange={(e) => handleInputChange('global_notifications', 'smtp_password', e.target.value)}
                          className="input-field"
                          placeholder="••••••••"
                          disabled={!settings.global_notifications.email_enabled}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* SMS Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-4">SMS Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Enable SMS Notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.global_notifications.sms_enabled}
                              onChange={(e) => handleInputChange('global_notifications', 'sms_enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMS Provider
                        </label>
                        <select
                          value={settings.global_notifications.sms_provider}
                          onChange={(e) => handleInputChange('global_notifications', 'sms_provider', e.target.value)}
                          className="input-field"
                          disabled={!settings.global_notifications.sms_enabled}
                        >
                          <option value="twilio">Twilio</option>
                          <option value="aws_sns">AWS SNS</option>
                          <option value="textlocal">TextLocal</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={settings.global_notifications.sms_api_key}
                          onChange={(e) => handleInputChange('global_notifications', 'sms_api_key', e.target.value)}
                          className="input-field"
                          placeholder="••••••••••••••••"
                          disabled={!settings.global_notifications.sms_enabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Backup & Restore */}
            {activeTab === 'backup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-red-600 mr-2" />
                  Backup & Restore Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Automatic Backup</h3>
                        <p className="text-sm text-gray-500">Enable scheduled automatic backups</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.backup_config.auto_backup}
                          onChange={(e) => handleInputChange('backup_config', 'auto_backup', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Frequency
                    </label>
                    <select
                      value={settings.backup_config.backup_frequency}
                      onChange={(e) => handleInputChange('backup_config', 'backup_frequency', e.target.value)}
                      className="input-field"
                      disabled={!settings.backup_config.auto_backup}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={settings.backup_config.retention_days}
                      onChange={(e) => handleInputChange('backup_config', 'retention_days', parseInt(e.target.value))}
                      className={`input-field ${errors['backup_config.retention_days'] ? 'border-red-500' : ''}`}
                      min="1"
                      max="3650"
                      disabled={!settings.backup_config.auto_backup}
                    />
                    {errors['backup_config.retention_days'] && typeof errors['backup_config.retention_days'] === 'string' && (
                      <p className="text-red-500 text-sm mt-1">{errors['backup_config.retention_days']}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Location
                    </label>
                    <input
                      type="text"
                      value={settings.backup_config.backup_location}
                      onChange={(e) => handleInputChange('backup_config', 'backup_location', e.target.value)}
                      className="input-field"
                      placeholder="/backups"
                      disabled={!settings.backup_config.auto_backup}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audit & Logging */}
            {activeTab === 'audit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-red-600 mr-2" />
                  Audit & Logging Configuration
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Enable Audit Logging</h3>
                      <p className="text-sm text-gray-500">Track all system changes and user actions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.audit_config.enable_audit_log}
                        onChange={(e) => handleInputChange('audit_config', 'enable_audit_log', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Log Retention (days)
                      </label>
                      <input
                        type="number"
                        value={settings.audit_config.log_retention_days}
                        onChange={(e) => handleInputChange('audit_config', 'log_retention_days', parseInt(e.target.value))}
                        className="input-field"
                        min="30"
                        max="3650"
                        disabled={!settings.audit_config.enable_audit_log}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Log Sensitive Data</h3>
                        <p className="text-sm text-gray-500">Include sensitive information in audit logs</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audit_config.log_sensitive_data}
                          onChange={(e) => handleInputChange('audit_config', 'log_sensitive_data', e.target.checked)}
                          className="sr-only peer"
                          disabled={!settings.audit_config.enable_audit_log}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Alert on Critical Changes</h3>
                        <p className="text-sm text-gray-500">Send notifications for critical system changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audit_config.alert_on_critical_changes}
                          onChange={(e) => handleInputChange('audit_config', 'alert_on_critical_changes', e.target.checked)}
                          className="sr-only peer"
                          disabled={!settings.audit_config.enable_audit_log}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}