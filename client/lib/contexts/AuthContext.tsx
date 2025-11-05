'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'
import Cookies from 'js-cookie'

interface User {
  id: string
  nome: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      Cookies.remove('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data
    
    Cookies.set('token', token, { expires: 7 })
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
  }

  const register = async (nome: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { nome, email, password })
    const { token, user } = response.data
    
    Cookies.set('token', token, { expires: 7 })
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
  }

  const logout = () => {
    Cookies.remove('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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