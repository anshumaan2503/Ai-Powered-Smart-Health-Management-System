'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from './api'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (loginIdentifier: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check both localStorage and sessionStorage for tokens
      let token = localStorage.getItem('access_token')
      if (!token) {
        token = sessionStorage.getItem('access_token')
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await api.get('/auth/profile')
      setUser(response.data.user)
    } catch (error) {
      // Clear tokens from both storages
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (loginIdentifier: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      // Send either email or username based on the input
      const loginData = loginIdentifier.includes('@')
        ? { email: loginIdentifier, password }
        : { username: loginIdentifier, password }

      const response = await api.post('/auth/login', loginData)
      const { access_token, refresh_token, user: userData } = response.data

      // Store tokens based on remember me preference
      if (rememberMe) {
        // Store in localStorage for persistent login
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        localStorage.setItem('user', JSON.stringify(userData))
        // Clear any session storage
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.removeItem('user')
      } else {
        // Store in sessionStorage for session-only login
        sessionStorage.setItem('access_token', access_token)
        sessionStorage.setItem('refresh_token', refresh_token)
        sessionStorage.setItem('user', JSON.stringify(userData))
        // Clear any localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }

      setUser(userData)

      toast.success(`Welcome back, ${userData.first_name}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      await api.post('/auth/register', userData)
      toast.success('Registration successful! Please login.')
      return true
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    // Clear tokens from both storages
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}