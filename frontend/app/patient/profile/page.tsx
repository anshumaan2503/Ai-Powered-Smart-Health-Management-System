'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserCircleIcon, HeartIcon, PhoneIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function PatientProfilePage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_history: '',
        allergies: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const response = await api.get('/auth/profile')
            // Extract user data from the wrapper
            const data = response.data.user || response.data

            setProfile(data)
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                date_of_birth: data.date_of_birth || '',
                gender: data.gender || '',
                blood_group: data.blood_group || '',
                address: data.address || '',
                emergency_contact_name: data.emergency_contact_name || '',
                emergency_contact_phone: data.emergency_contact_phone || '',
                medical_history: data.medical_history || '',
                allergies: data.allergies || ''
            })
        } catch (error: any) {
            console.error('Failed to fetch profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await api.put('/auth/profile', formData)
            toast.success('Profile updated successfully!')
            fetchProfile()
        } catch (error: any) {
            console.error('Failed to update profile:', error)
            toast.error(error.response?.data?.error || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
                                <UserCircleIcon className="h-12 w-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    My Profile
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your personal information</p>
                            </div>
                        </div>
                        {profile?.patient_id && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Patient ID</span>
                                <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{profile.patient_id}</p>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                <UserCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    placeholder="Email address"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    Date of Birth <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
                                    Blood Group
                                </label>
                                <select
                                    name="blood_group"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Enter your complete address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                                <PhoneIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Emergency Contact</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Emergency contact name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                <HeartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Medical Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Medical History
                                </label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Any past medical conditions, surgeries, or chronic illnesses..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Allergies
                                </label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Any known allergies to medications, foods, etc..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {saving ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
