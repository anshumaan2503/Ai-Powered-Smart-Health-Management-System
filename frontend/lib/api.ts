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

    // Hospital endpoints -> hospital token
    if (url.includes('/hospital-auth/') || url.includes('/hospital/')) {
      const hospitalToken = localStorage.getItem('hospital_access_token')
      if (hospitalToken) {
        config.headers.Authorization = `Bearer ${hospitalToken}`
      }
    } else {
  // ✅ Admin endpoints -> admin token
  if (url.includes('/admin/')) {
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  }

  // ✅ Patient/auth endpoints -> patient token
  let token = localStorage.getItem('access_token')
  if (!token) token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
}

    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Refresh only for patient tokens
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        let refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) refreshToken = sessionStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // ✅ refresh endpoint is /api/auth/refresh (baseURL already has /api)
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        )

        const { access_token } = response.data

        if (!access_token) {
          throw new Error('No access_token from refresh API')
        }

        // Store in same place as refresh token
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', access_token)
        } else {
          sessionStorage.setItem('access_token', access_token)
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')

        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
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
  getById: (id: number) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients/', data),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
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
}