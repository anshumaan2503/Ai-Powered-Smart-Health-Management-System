import axios from 'axios'
import toast from 'react-hot-toast'

// ✅ Base domain only (NO /api here)
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const BASE_DOMAIN = NEXT_PUBLIC_API_URL || NEXT_PUBLIC_BACKEND_URL

if (!BASE_DOMAIN) {
  throw new Error(
    '❌ Missing API base URL. Set NEXT_PUBLIC_API_URL (recommended) or NEXT_PUBLIC_BACKEND_URL.'
  )
}

// ✅ Always add /api once here
const API_BASE_URL = `${BASE_DOMAIN.replace(/\/$/, '')}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const url = config.url || ''

    // Determine portal context
    const isHospitalPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/hospital')
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
    const isHospitalURL = url.includes('/hospital/') || url.includes('/hospital-auth/')
    const isAdminURL = url.includes('/admin/')

    // Get all available tokens
    const hospitalToken = localStorage.getItem('hospital_access_token')
    const patientToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    const adminToken = localStorage.getItem('admin_token')

    // Helper to check if token is valid string
    const isValid = (t: any) => t && t !== 'null' && t !== 'undefined'

    // 1. Hospital Context (Portal or explicit URL)
    if ((isHospitalPath || isHospitalURL)) {
      if (isValid(hospitalToken)) {
        config.headers.Authorization = `Bearer ${hospitalToken}`
      }
      // CRITICAL: If we are in hospital context, DO NOT fall back to patient token
      // This prevents 401/403 errors when accessing hospital-only endpoints with a patient session
    }
    // 2. Admin Context
    else if ((isAdminPath || isAdminURL)) {
      if (isValid(adminToken)) {
        config.headers.Authorization = `Bearer ${adminToken}`
      }
    }
    // 3. Fallback to Patient Context
    else if (isValid(patientToken)) {
      config.headers.Authorization = `Bearer ${patientToken}`
    }

    // ✅ Fix: If sending FormData, let the browser set the Content-Type with boundary
    // We handle common casing because different versions of axios/interceptors might vary
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
        delete config.headers['CONTENT-TYPE']
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const isHospitalPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/hospital')

      if (!isHospitalPortal) {
        const patientRefreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
        if (patientRefreshToken) {
          try {
            const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
              headers: { Authorization: `Bearer ${patientRefreshToken}` }
            })
            if (resp.data.access_token) {
              const token = resp.data.access_token
              if (localStorage.getItem('refresh_token')) {
                localStorage.setItem('access_token', token)
              } else {
                sessionStorage.setItem('access_token', token)
              }
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            }
          } catch (e) { }
        }
      }

      // Final redirect
      if (typeof window !== 'undefined') {
        if (isHospitalPortal) {
          localStorage.removeItem('hospital_access_token')
          localStorage.removeItem('hospital_user')
          window.location.href = '/hospital/login'
        } else {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          sessionStorage.clear()
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }

    if (error.response?.status >= 500) {
      const msg = error.response?.data?.error || 'Server error. Please try again later.'
      toast.error(msg)
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    return Promise.reject(error)
  }
)

// ✅ API endpoints (notice: no /api prefix here)
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: any) =>
    api.post('/auth/register', userData),

  getProfile: () =>
    api.get('/auth/profile'),

  refreshToken: () =>
    api.post('/auth/refresh'),
}

export const patientsAPI = {
  getAll: (params?: any) => api.get('/patients/', { params }),
  getPatients: (params?: any) => api.get('/patients/', { params }), // Alias for consistency
  getById: (id: number) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients/', data),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
  deletePatient: (id: number) => api.delete(`/patients/${id}`), // Alias for consistency
}

export const doctorsAPI = {
  getAll: (params?: any) => api.get('/doctors/', { params }),
  getById: (id: number) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
}

export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/appointments/', { params }),
  create: (data: any) => api.post('/appointments/', data),
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
}

export const aiAPI = {
  symptomChecker: (data: any) => api.post('/ai/symptom-checker', data),
  chatbot: (data: { message: string; context?: any[] }) =>
    api.post('/ai/chatbot', data),
  riskAssessment: (patientId: number) =>
    api.post('/ai/risk-assessment', { patient_id: patientId }),
  treatmentRecommendations: (diagnosisId: number) =>
    api.post('/ai/treatment-recommendations', { diagnosis_id: diagnosisId }),
  getDiagnoses: (patientId: number) => api.get(`/ai/diagnoses/${patientId}`),
  verifyDiagnosis: (diagnosisId: number, data: any) =>
    api.put(`/ai/verify-diagnosis/${diagnosisId}`, data),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId: number) =>
    api.put(`/admin/users/${userId}/toggle-status`),

  // Hospital management
  getHospitals: () => api.get('/admin/hospitals'),
  getHospitalById: (id: number) => api.get(`/admin/hospitals/${id}`),
  updateHospital: (id: number, data: any) => api.put(`/admin/hospitals/${id}/edit`, data),
  deleteHospital: (id: number, confirmationName: string) =>
    api.delete(`/admin/hospitals/${id}/delete`, { data: { confirmationName } }),
  changeHospitalPassword: (id: number, newPassword: string, confirmPassword: string) =>
    api.post(`/admin/hospitals/${id}/change-password`, { newPassword, confirmPassword }),
  resetHospitalPassword: (id: number) =>
    api.post(`/admin/hospitals/${id}/reset-password`),

  // Subscriptions
  getSubscriptions: () => api.get('/admin/subscriptions'),
  upgradeSubscription: (id: number, data: any) =>
    api.put(`/admin/subscriptions/${id}/upgrade`, data),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
}

export const hospitalAPI = {
  // Staff/Doctors
  getStaff: () => api.get('/hospital/staff'),
  getStaffById: (id: number) => api.get(`/hospital/staff/${id}`),
  createStaff: (data: any) => api.post('/hospital/staff', data),
  updateStaff: (id: number, data: any) => api.put(`/hospital/staff/${id}`, data),
  deleteStaff: (id: number) => api.delete(`/hospital/staff/${id}`),
  downloadStaffTemplate: () => api.get('/hospital/import-staff-template', { responseType: 'blob' }),
  importStaff: (data: FormData) => api.post('/hospital/import-staff', data),

  // Pharmacy
  getMedicines: () => api.get('/hospital/pharmacy/medicines'),
  downloadMedicinesTemplate: () => api.get('/hospital/pharmacy/import-medicines-template', { responseType: 'blob' }),
  importMedicines: (data: FormData) => api.post('/hospital/pharmacy/import-medicines', data),
  deleteMedicine: (id: number) => api.delete(`/hospital/pharmacy/medicines/${id}`),
  deleteAllMedicines: () => api.delete('/hospital/pharmacy/medicines/delete-all'),

  // Analytics
  getAnalyticsOverview: (period: string) => api.get(`/hospital/analytics/overview?period=${period}`),
  getAnalyticsAppointments: () => api.get('/hospital/analytics/appointments'),
  getAnalyticsPatients: () => api.get('/hospital/analytics/patients'),
  getAnalyticsDoctors: () => api.get('/hospital/analytics/doctors'),
  getAnalyticsRevenue: () => api.get('/hospital/analytics/revenue'),

  // Patients (hospital-specific imports)
  importPatients: (data: FormData) => api.post('/hospital/patients/import', data),
}