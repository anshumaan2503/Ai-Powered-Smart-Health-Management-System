'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { patientsAPI } from '@/lib/api'
import { motion } from 'framer-motion'
import {
    PencilSquareIcon,
    ArrowLeftIcon,
    UserIcon,
    PhoneIcon,
    HeartIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PatientFormData {
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth: string
    gender: string
    blood_group: string
    address: string
    emergency_contact_name: string
    emergency_contact_phone: string
    allergies: string
    medical_history: string
    insurance_number: string
}

export default function EditPatientPage() {
    const params = useParams()
    const patientId = params.id as string
    const [formData, setFormData] = useState<PatientFormData>({
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
        allergies: '',
        medical_history: '',
        insurance_number: ''
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const router = useRouter()

    useEffect(() => {
        fetchPatientData()
    }, [patientId])

    const fetchPatientData = async () => {
        try {
            setLoading(true)
            const response = await patientsAPI.getById(parseInt(patientId))
            const patient = response.data.patient

            setFormData({
                first_name: patient.first_name || '',
                last_name: patient.last_name || '',
                email: patient.email || '',
                phone: patient.phone || '',
                date_of_birth: patient.date_of_birth || '',
                gender: patient.gender || '',
                blood_group: patient.blood_group || '',
                address: patient.address || '',
                emergency_contact_name: patient.emergency_contact_name || '',
                emergency_contact_phone: patient.emergency_contact_phone || '',
                allergies: patient.allergies || '',
                medical_history: patient.medical_history || '',
                insurance_number: patient.insurance_number || ''
            })
        } catch (error: any) {
            console.error('Error fetching patient data:', error)
            toast.error('Failed to load patient data')
            router.push('/hospital/dashboard/patients')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.gender) newErrors.gender = 'Gender is required'

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }

        try {
            setSaving(true)
            await patientsAPI.update(parseInt(patientId), formData)
            toast.success('Patient information updated successfully!')
            router.push(`/hospital/dashboard/patients/${patientId}`)
        } catch (error: any) {
            console.error('Error updating patient:', error)
            toast.error(error.response?.data?.error || 'Failed to update patient')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href={`/hospital/dashboard/patients/${patientId}`}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <PencilSquareIcon className="h-8 w-8 text-blue-600 mr-3" />
                            Edit Patient Profile
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Update personal and medical information for {formData.first_name} {formData.last_name}
                        </p>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Section 1: Personal Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                            <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.first_name ? 'border-red-300 ring-red-200' : ''}`}
                                />
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.last_name ? 'border-red-300 ring-red-200' : ''}`}
                                />
                                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Info */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                            <PhoneIcon className="h-5 w-5 text-blue-600 mr-2" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.phone ? 'border-red-300 ring-red-200' : ''}`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Medical Info */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                            <HeartIcon className="h-5 w-5 text-red-600 mr-2" />
                            Medical Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select
                                    name="blood_group"
                                    value={formData.blood_group}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="">Unknown</option>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                                <input
                                    type="text"
                                    name="insurance_number"
                                    value={formData.insurance_number}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="input-field"
                                    placeholder="List any known allergies..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="input-field"
                                    placeholder="Brief summary of past conditions, surgeries, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Emergency Contact */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                            <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                            Emergency Contact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                <input
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary"
                        >
                            {saving ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Saving...</span>
                                </div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
