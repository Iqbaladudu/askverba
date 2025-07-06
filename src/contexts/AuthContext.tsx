'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

type AuthContextType = {
  customer: Customer | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (customer: Customer, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth-token')
    const storedCustomer = localStorage.getItem('auth-customer')

    if (storedToken && storedCustomer) {
      try {
        const parsedCustomer = JSON.parse(storedCustomer)
        setToken(storedToken)
        setCustomer(parsedCustomer)
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-customer')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (customer: Customer, token: string) => {
    setCustomer(customer)
    setToken(token)
    localStorage.setItem('auth-token', token)
    localStorage.setItem('auth-customer', JSON.stringify(customer))
  }

  const logout = () => {
    setCustomer(null)
    setToken(null)
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-customer')
  }

  const value = {
    customer,
    token,
    isAuthenticated: !!customer && !!token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
