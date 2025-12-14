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
  TrashIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  XMarkIcon
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
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; medicine: Medicine | null }>({ show: false, medicine: null })
  const [deleteAllModal, setDeleteAllModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
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

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('hospital_access_token')
      const response = await fetch('http://localhost:5000/api/hospital/pharmacy/import-medicines-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const csvContent = data.template || "name,quantity\nParacetamol 500mg,100\nAmoxicillin 250mg,50"
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'medicines_import_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Template downloaded successfully')
      } else {
        // Fallback template
        const csvContent = "name,quantity\nParacetamol 500mg,100\nAmoxicillin 250mg,50\nIbuprofen 400mg,75"
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'medicines_import_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Template downloaded successfully')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Failed to download template')
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    setImporting(true)
    setImportResults(null)

    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        toast.error('Please login first')
        return
      }

      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('http://localhost:5000/api/hospital/pharmacy/import-medicines', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setImportResults(data)
        toast.success(`Import completed: ${data.imported_count} medicines imported`)
        // Reload medicines list
        loadMedicines()
        loadDashboardStats()
      } else {
        toast.error(data.error || 'Import failed')
        setImportResults({
          imported_count: 0,
          errors_count: 1,
          errors: [data.error || 'Import failed']
        })
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error('Import failed: ' + error.message)
      setImportResults({
        imported_count: 0,
        errors_count: 1,
        errors: [error.message || 'Import failed']
      })
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.medicine) return

    setDeleting(true)
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        toast.error('Please login first')
        return
      }

      const response = await fetch(`http://localhost:5000/api/hospital/pharmacy/medicines/${deleteModal.medicine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Medicine deleted successfully')
        setDeleteModal({ show: false, medicine: null })
        // Reload medicines list
        loadMedicines()
        loadDashboardStats()
      } else {
        toast.error(data.error || 'Failed to delete medicine')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete medicine: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeletingAll(true)
    try {
      const token = localStorage.getItem('hospital_access_token')
      if (!token) {
        toast.error('Please login first')
        return
      }

      const response = await fetch('http://localhost:5000/api/hospital/pharmacy/medicines/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || `Successfully deleted ${data.deleted_count} medicine(s)`)
        setDeleteAllModal(false)
        // Reload medicines list
        loadMedicines()
        loadDashboardStats()
      } else {
        toast.error(data.error || 'Failed to delete all medicines')
      }
    } catch (error: any) {
      console.error('Delete all error:', error)
      toast.error('Failed to delete all medicines: ' + error.message)
    } finally {
      setDeletingAll(false)
    }
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
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Import CSV
          </button>
          {medicines.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="btn-secondary flex items-center bg-red-600 hover:bg-red-700 text-white"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete All
            </button>
          )}
          <button
            onClick={() => {
              toast.info('Add Medicine feature coming soon. Use Import CSV to add medicines.')
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Medicine
          </button>
        </div>
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
                      <div>MRP: {medicine.mrp ? formatCurrency(medicine.mrp) : '₹0'}</div>
                      <div>Cost: {medicine.cost_price ? formatCurrency(medicine.cost_price) : '₹0'}</div>
                      {medicine.cost_price && medicine.selling_price && (
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
                      )}
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
                      <button 
                        onClick={() => {
                          toast.info('View medicine details feature coming soon')
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          toast.info('Edit medicine feature coming soon')
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Edit medicine"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ show: true, medicine })}
                        className="text-red-600 hover:text-red-900"
                        title="Delete medicine"
                      >
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
          <div className="mt-6 flex space-x-3 justify-center">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => {
                if (!stats) {
                  console.log('Retrying to load medicines...')
                  loadMedicines()
                  loadDashboardStats()
                } else {
                  toast.info('Add Medicine feature coming soon. Use Import CSV to add medicines.')
                }
              }}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {stats ? 'Add Medicine' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Import Medicines Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Import Medicines from CSV</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportResults(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {!importResults ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a CSV file with medicine data.
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      <strong>Required:</strong> name, quantity<br/>
                      <strong>Optional:</strong> mrp, cost_price, selling_price, expiry_date (format: YYYY-MM-DD or DD-MM-YYYY)
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600">
                        <label htmlFor="csv-upload-medicines" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">Click to upload</span>
                          <span> or drag and drop</span>
                          <input
                            id="csv-upload-medicines"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="sr-only"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">CSV or Excel files (.csv, .xlsx, .xls)</p>
                    </div>

                    {importFile && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <button
                      onClick={() => downloadTemplate()}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      Download CSV Template
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowImportModal(false)
                        setImportFile(null)
                      }}
                      disabled={importing}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!importFile || importing}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {importing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Importing...</span>
                        </>
                      ) : (
                        'Import Medicines'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CloudArrowUpIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Import Complete</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-green-600">
                          ✅ {importResults.imported_count} medicines imported successfully
                        </p>
                        {importResults.skipped_count > 0 && (
                          <p className="text-sm text-yellow-600">
                            ⚠️ {importResults.skipped_count} medicines updated (already existed)
                          </p>
                        )}
                        {importResults.errors_count > 0 && (
                          <p className="text-sm text-red-600">
                            ❌ {importResults.errors_count} errors occurred
                          </p>
                        )}
                      </div>
                    </div>

                    {importResults.errors && importResults.errors.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg max-h-40 overflow-y-auto">
                        <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
                        <ul className="text-xs text-red-700 space-y-1">
                          {importResults.errors.slice(0, 5).map((error: any, index: number) => (
                            <li key={index}>• Row {error.row}: {error.error}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>• ... and {importResults.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {importResults.imported_medicines && importResults.imported_medicines.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg max-h-40 overflow-y-auto">
                        <h5 className="text-sm font-medium text-green-800 mb-2">Imported Medicines:</h5>
                        <ul className="text-xs text-green-700 space-y-1">
                          {importResults.imported_medicines.map((medicine: any, index: number) => (
                            <li key={index}>• {medicine.name} (Qty: {medicine.quantity})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFile(null)
                      setImportResults(null)
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.medicine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Medicine</h3>
                <button
                  onClick={() => setDeleteModal({ show: false, medicine: null })}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={deleting}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to delete this medicine?
                </p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{deleteModal.medicine.name}</p>
                  {deleteModal.medicine.brand_name && (
                    <p className="text-sm text-gray-600">{deleteModal.medicine.brand_name}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Stock: {deleteModal.medicine.quantity_in_stock} {deleteModal.medicine.unit_of_measurement}
                  </p>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  This action cannot be undone. The medicine will be removed from your inventory.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteModal({ show: false, medicine: null })}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Deleting...</span>
                    </>
                  ) : (
                    'Delete Medicine'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-red-900">Delete All Medicines</h3>
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={deletingAll}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 mb-1">Warning: Destructive Action</p>
                      <p className="text-sm text-red-800">
                        This will permanently delete <strong>all {medicines.length} medicine(s)</strong> from your inventory.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Are you absolutely sure you want to delete all medicines? This action:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                  <li>Will remove all medicines from your inventory</li>
                  <li>Cannot be undone</li>
                  <li>Will affect all stock records</li>
                </ul>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Total medicines to delete:</strong> {medicines.length}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteAllModal(false)}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {deletingAll ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Deleting...</span>
                    </>
                  ) : (
                    'Delete All Medicines'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}