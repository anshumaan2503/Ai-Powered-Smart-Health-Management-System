'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  FunnelIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterHospital, setFilterHospital] = useState('all')
  const [hospitals, setHospitals] = useState<any[]>([])

  useEffect(() => {
    loadUsers()
    loadHospitals()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterRole, filterHospital])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch users from backend
      const response = await fetch('http://localhost:5000/api/admin/users', { headers })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        // Fallback to mock data if API fails
        setUsers(getMockUsers())
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers(getMockUsers())
    } finally {
      setLoading(false)
    }
  }

  const loadHospitals = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch('http://localhost:5000/api/admin/hospitals', { headers })
      if (response.ok) {
        const data = await response.json()
        setHospitals(data.hospitals)
      }
    } catch (error) {
      console.error('Error loading hospitals:', error)
    }
  }

  const getMockUsers = () => [
    {
      id: 1,
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@cityhospital.com',
      phone: '+91 98765 43210',
      role: 'admin',
      hospitalId: 2,
      hospitalName: 'City General Hospital',
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-15',
      isActive: true
    },
    {
      id: 2,
      firstName: 'Dr. Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@cityhospital.com',
      phone: '+91 98765 43211',
      role: 'doctor',
      hospitalId: 2,
      hospitalName: 'City General Hospital',
      lastLogin: '2024-01-19',
      createdAt: '2024-01-16',
      isActive: true
    },
    {
      id: 3,
      firstName: 'Nurse',
      lastName: 'Anita',
      email: 'anita.nurse@cityhospital.com',
      phone: '+91 98765 43212',
      role: 'nurse',
      hospitalId: 2,
      hospitalName: 'City General Hospital',
      lastLogin: '2024-01-18',
      createdAt: '2024-01-17',
      isActive: true
    }
  ]

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    if (filterHospital !== 'all') {
      filtered = filtered.filter(user => user.hospitalId.toString() === filterHospital)
    }

    setFilteredUsers(filtered)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'doctor': return 'bg-blue-100 text-blue-800'
      case 'nurse': return 'bg-green-100 text-green-800'
      case 'staff': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return ShieldCheckIcon
      case 'doctor': return UserIcon
      case 'nurse': return UserIcon
      case 'staff': return UserGroupIcon
      default: return UserIcon
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users across the platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Total: {users.length} users
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['admin', 'doctor', 'nurse', 'staff'].map((role, index) => {
          const count = users.filter(user => user.role === role).length
          const RoleIcon = getRoleIcon(role)
          
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                  <p className="text-sm text-gray-600 capitalize">{role}s</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  role === 'admin' ? 'bg-red-50' :
                  role === 'doctor' ? 'bg-blue-50' :
                  role === 'nurse' ? 'bg-green-50' : 'bg-purple-50'
                }`}>
                  <RoleIcon className={`h-6 w-6 ${
                    role === 'admin' ? 'text-red-600' :
                    role === 'doctor' ? 'text-blue-600' :
                    role === 'nurse' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="doctor">Doctors</option>
            <option value="nurse">Nurses</option>
            <option value="staff">Staff</option>
          </select>

          {/* Hospital Filter */}
          <select
            value={filterHospital}
            onChange={(e) => setFilterHospital(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Hospitals</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id.toString()}>
                {hospital.name}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {filteredUsers.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
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
              {filteredUsers.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                          <span className="text-gray-600 font-semibold text-sm">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <RoleIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOffice2Icon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.hospitalName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View User"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}