'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BeakerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface Medicine {
  id: number
  name: string
  generic_name: string
  brand_name: string
  manufacturer: string
  category: string
  strength: string
  quantity_in_stock: number
  unit_of_measurement: string
  reorder_level: number
  cost_price: number
  selling_price: number
  mrp: number
  expiry_date: string
  batch_number: string
  stock_status: string
  is_expired: boolean
  days_to_expiry: number
  is_low_stock: boolean
  profit_margin: number
}

interface DashboardStats {
  total_medicines: number
  low_stock: number
  out_of_stock: number
  expired: number
  expiring_soon: number
  total_inventory_value: number
  recent_movements: number
  top_categories: Array<{name: string, count: number}>
}

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadDashboardStats()
    loadMedicines()
  }, [currentPage, searchTerm, selectedCategory, selectedStatus])

  const loadDashboardStats = async () => {
    try {
      console.log('Loading dashboard stats...')
      const response = await fetch('/api/hospital/pharmacy/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hospital_access_token')}`
        }
      })
      
      console.log('Dashboard stats response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard stats data:', data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error('Dashboard stats error:', response.status, errorText)
        // Don't show error toast here as loadMedicines will handle sample data
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Don't show error toast here as loadMedicines will handle sample data
    }
  }

  const loadMedicines = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '20'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      
      console.log('Loading medicines with params:', params.toString())
      
      const response = await fetch(`/api/hospital/pharmacy/medicines?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hospital_access_token')}`
        }
      })
      
      console.log('Medicines response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Medicines data:', data)
        setMedicines(data.medicines)
        setCategories(data.categories)
        setTotalPages(data.pagination.pages)
      } else {
        const errorText = await response.text()
        console.error('Medicines error:', response.status, errorText)
        
        // Load sample data as fallback
        console.log('Loading sample medicine data as fallback...')
        loadSampleData()
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
      
      // Load sample data as fallback
      console.log('Loading sample medicine data as fallback...')
      loadSampleData()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    // Sample Indian medicine data for demonstration
    const sampleMedicines: Medicine[] = [
      {
        id: 1,
        name: 'Paracetamol',
        generic_name: 'Paracetamol',
        brand_name: 'Crocin',
        manufacturer: 'GlaxoSmithKline',
        category: 'Analgesic',
        strength: '650mg',
        quantity_in_stock: 150,
        unit_of_measurement: 'pieces',
        reorder_level: 20,
        cost_price: 15,
        selling_price: 25,
        mrp: 30,
        expiry_date: '2025-12-31',
        batch_number: 'BT123456',
        stock_status: 'In Stock',
        is_expired: false,
        days_to_expiry: 365,
        is_low_stock: false,
        profit_margin: 66.7
      },
      {
        id: 2,
        name: 'Amoxicillin',
        generic_name: 'Amoxicillin',
        brand_name: 'Amoxil',
        manufacturer: 'GlaxoSmithKline',
        category: 'Antibiotic',
        strength: '500mg',
        quantity_in_stock: 8,
        unit_of_measurement: 'pieces',
        reorder_level: 10,
        cost_price: 45,
        selling_price: 65,
        mrp: 75,
        expiry_date: '2025-06-30',
        batch_number: 'BT789012',
        stock_status: 'Low Stock',
        is_expired: false,
        days_to_expiry: 180,
        is_low_stock: true,
        profit_margin: 44.4
      },
      {
        id: 3,
        name: 'Metformin',
        generic_name: 'Metformin',
        brand_name: 'Glycomet',
        manufacturer: 'USV',
        category: 'Antidiabetic',
        strength: '500mg',
        quantity_in_stock: 200,
        unit_of_measurement: 'pieces',
        reorder_level: 25,
        cost_price: 35,
        selling_price: 55,
        mrp: 65,
        expiry_date: '2026-03-15',
        batch_number: 'BT345678',
        stock_status: 'In Stock',
        is_expired: false,
        days_to_expiry: 500,
        is_low_stock: false,
        profit_margin: 57.1
      },
      {
        id: 4,
        name: 'Cetirizine',
        generic_name: 'Cetirizine',
        brand_name: 'Zyrtec',
        manufacturer: 'UCB',
        category: 'Antihistamine',
        strength: '10mg',
        quantity_in_stock: 0,
        unit_of_measurement: 'pieces',
        reorder_level: 15,
        cost_price: 18,
        selling_price: 32,
        mrp: 38,
        expiry_date: '2024-12-31',
        batch_number: 'BT901234',
        stock_status: 'Out of Stock',
        is_expired: false,
        days_to_expiry: 60,
        is_low_stock: true,
        profit_margin: 77.8
      },
      {
        id: 5,
        name: 'Vitamin D3',
        generic_name: 'Cholecalciferol',
        brand_name: 'Calcirol',
        manufacturer: 'Cadila Healthcare',
        category: 'Vitamin',
        strength: '60000 IU',
        quantity_in_stock: 75,
        unit_of_measurement: 'pieces',
        reorder_level: 20,
        cost_price: 45,
        selling_price: 68,
        mrp: 78,
        expiry_date: '2025-09-30',
        batch_number: 'BT567890',
        stock_status: 'In Stock',
        is_expired: false,
        days_to_expiry: 300,
        is_low_stock: false,
        profit_margin: 51.1
      }
    ]

    const sampleStats: DashboardStats = {
      total_medicines: 5,
      low_stock: 2,
      out_of_stock: 1,
      expired: 0,
      expiring_soon: 1,
      total_inventory_value: 15000,
      recent_movements: 12,
      top_categories: [
        { name: 'Analgesic', count: 1 },
        { name: 'Antibiotic', count: 1 },
        { name: 'Antidiabetic', count: 1 },
        { name: 'Antihistamine', count: 1 },
        { name: 'Vitamin', count: 1 }
      ]
    }

    setMedicines(sampleMedicines)
    setStats(sampleStats)
    setCategories(['Analgesic', 'Antibiotic', 'Antidiabetic', 'Antihistamine', 'Vitamin'])
    setTotalPages(1)
    
    toast.success('Loaded sample medicine data for demonstration')
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'Out of Stock': return 'text-red-600 bg-red-100'
      case 'Low Stock': return 'text-yellow-600 bg-yellow-100'
      case 'Overstock': return 'text-purple-600 bg-purple-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getExpiryStatusColor = (daysToExpiry: number, isExpired: boolean) => {
    if (isExpired) return 'text-red-600'
    if (daysToExpiry <= 30) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
            Pharmacy Inventory
          </h1>
          <p className="text-gray-600 mt-1">
            Manage medicines, track stock levels, and monitor expiry dates
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_medicines}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.low_stock}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_inventory_value)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines by name, brand, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="low_stock">Low Stock</option>
              <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {medicine.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {medicine.brand_name && `${medicine.brand_name} • `}
                        {medicine.strength}
                      </div>
                      <div className="text-xs text-gray-400">
                        {medicine.manufacturer}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {medicine.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {medicine.quantity_in_stock} {medicine.unit_of_measurement}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(medicine.stock_status)}`}>
                        {medicine.stock_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>MRP: {formatCurrency(medicine.mrp)}</div>
                      <div>Cost: {formatCurrency(medicine.cost_price)}</div>
                      <div className="flex items-center">
                        {medicine.profit_margin > 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={medicine.profit_margin > 0 ? 'text-green-600' : 'text-red-600'}>
                          {medicine.profit_margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getExpiryStatusColor(medicine.days_to_expiry, medicine.is_expired)}`}>
                      {medicine.is_expired ? (
                        <span className="font-medium">Expired</span>
                      ) : medicine.days_to_expiry !== null ? (
                        <span>{medicine.days_to_expiry} days</span>
                      ) : (
                        <span>No expiry</span>
                      )}
                      <div className="text-xs text-gray-500">
                        {medicine.expiry_date && new Date(medicine.expiry_date).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {medicines.length === 0 && !loading && (
        <div className="text-center py-12">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {stats ? 
              "Get started by adding your first medicine to the inventory." :
              "Unable to connect to the pharmacy system. Please check your connection and try again."
            }
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                console.log('Retrying to load medicines...')
                loadMedicines()
                loadDashboardStats()
              }}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {stats ? 'Add Medicine' : 'Retry'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}