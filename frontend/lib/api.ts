import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for patient token first, then hospital token, then sessionStorage
    let token = localStorage.getItem('access_token')
    if (!token) {
      token = localStorage.getItem('hospital_access_token')
    }
    if (!token) {
      token = sessionStorage.getItem('access_token')
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Check both storages for refresh token
        let refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          refreshToken = sessionStorage.getItem('refresh_token')
        }

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        })

        const { access_token } = response.data

        // Store new token in the same storage as the refresh token
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', access_token)
        } else {
          sessionStorage.setItem('access_token', access_token)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    return Promise.reject(error)
  }
)

// API endpoints
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
  getAll: (params?: any) =>
    api.get('/patients/', { params }),
  getById: (id: number) =>
    api.get(`/patients/${id}`),
  create: (data: any) =>
    api.post('/patients/', data),
  update: (id: number, data: any) =>
    api.put(`/patients/${id}`, data),
  delete: (id: number) =>
    api.delete(`/patients/${id}`),
}

export const doctorsAPI = {
  getAll: (params?: any) =>
    api.get('/doctors/', { params }),
  getById: (id: number) =>
    api.get(`/doctors/${id}`),
  getSpecializations: () =>
    api.get('/doctors/specializations'),
}

export const appointmentsAPI = {
  getAll: (params?: any) =>
    api.get('/appointments/', { params }),
  create: (data: any) =>
    api.post('/appointments/', data),
  update: (id: number, data: any) =>
    api.put(`/appointments/${id}`, data),
}

export const aiAPI = {
  symptomChecker: (data: any) =>
    api.post('/ai/symptom-checker', data),
  chatbot: (data: { message: string; context?: any[] }) =>
    api.post('/ai/chatbot', data),
  riskAssessment: (patientId: number) =>
    api.post('/ai/risk-assessment', { patient_id: patientId }),
  treatmentRecommendations: (diagnosisId: number) =>
    api.post('/ai/treatment-recommendations', { diagnosis_id: diagnosisId }),
  getDiagnoses: (patientId: number) =>
    api.get(`/ai/diagnoses/${patientId}`),
  verifyDiagnosis: (diagnosisId: number, data: any) =>
    api.put(`/ai/verify-diagnosis/${diagnosisId}`, data),
}

export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  toggleUserStatus: (userId: number) =>
    api.put(`/admin/users/${userId}/toggle-status`),
}