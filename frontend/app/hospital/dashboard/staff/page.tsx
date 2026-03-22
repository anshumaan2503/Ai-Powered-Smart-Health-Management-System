'use client'

import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { api, hospitalAPI } from '@/lib/api'
import useSWR from 'swr'
import toast from 'react-hot-toast'

interface StaffMember {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
  doctor_profile?: {
    specialization: string
    qualification: string
    experience_years: number
    consultation_fee: number
  }
}

/**
 * Renders the staff management page for hospital administrative users.
 *
 * Shows a searchable, role-filterable list of non-doctor staff (excludes members with role "doctor" and the email "city@hospital.com"), displays loading and error states, allows toggling a staff member's active status, and provides navigation to import, add, and edit staff screens.
 *
 * @returns The component's rendered JSX element representing the staff management UI.
 */
export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [error, setError] = useState('')

  const { data: staffResponse, error: fetchError, mutate } = useSWR(
    ['hospital-staff', roleFilter],
    () => hospitalAPI.getStaff({ role: roleFilter, per_page: 10 }),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000 
    }
  )

  const staffCount = staffResponse?.data?.staff?.length || 0
  const loading = !staffResponse && !fetchError
  const errorValue = fetchError?.response?.status === 401 
    ? 'Authentication required. Please login again.' 
    : (fetchError?.response?.data?.error || fetchError?.message || '')

  useEffect(() => {
    if (errorValue) setError(errorValue)
  }, [errorValue])

  // Split staff into non-doctors
  const staff = (staffResponse?.data?.staff || []).filter((member: StaffMember) => {
    const role = member.role.toLowerCase()
    return role !== 'doctor' && member.email !== 'city@hospital.com'
  })

  const toggleStaffStatus = async (staffId: number) => {
    try {
      await hospitalAPI.toggleStaffStatus(staffId)
      mutate()
      toast.success('Staff status updated')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update staff status')
    }
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchTerm === '' ||
      `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'doctor': return 'bg-blue-100 text-blue-800'
      case 'nurse': return 'bg-green-100 text-green-800'
      case 'receptionist': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading staff members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage nurses, receptionists, and administrative staff</p>
          <p className="text-sm text-blue-600 mt-1">
            👨‍⚕️ Doctors are managed separately in the <Link href="/hospital/dashboard/doctors" className="underline">Doctors section</Link>
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/hospital/dashboard/staff/import"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            <span>Import Staff</span>
          </Link>
          <Link
            href="/hospital/dashboard/staff/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Staff Member</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Staff Roles</option>
              <option value="admin">Admin</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
            <Link
              href="/hospital/dashboard/staff/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Staff Member</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          {member.doctor_profile && (
                            <div className="text-sm text-gray-500">
                              {member.doctor_profile.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleStaffStatus(member.id)}
                          className={`px-3 py-1 rounded text-xs font-medium ${member.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {member.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          href={`/hospital/dashboard/staff/${member.id}/edit`}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}