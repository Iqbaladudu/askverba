'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getAuthTokenHybrid,
  getCustomerHybrid,
  setAuthCookiesOnClient,
  clearAuthCookiesOnClient,
} from '@/lib/auth-cookies'
import { cleanupOldAuthStorage } from '@/lib/cleanup-storage'

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
    // Set a timeout to prevent hanging indefinitely
    const timeoutId = setTimeout(() => {
      console.warn('AuthContext: Authentication check timed out, setting loading to false')
      setIsLoading(false)
    }, 5000) // 5 second timeout

    // Clean up old localStorage data first
    cleanupOldAuthStorage()

    console.log('AuthContext: Checking for stored auth data...')

    try {
      // Check for stored auth data on mount using cookies only
      const storedToken = getAuthTokenHybrid()
      const storedCustomer = getCustomerHybrid()

      console.log('AuthContext: Found stored data:', {
        hasToken: !!storedToken,
        hasCustomer: !!storedCustomer,
        tokenLength: storedToken?.length || 0,
        customerEmail: storedCustomer?.email || 'none',
      })

      if (storedToken && storedCustomer) {
        try {
          setToken(storedToken)
          setCustomer(storedCustomer)
          console.log('AuthContext: Successfully restored authentication state')
        } catch (error) {
          console.error('AuthContext: Error restoring auth state:', error)
          // Clear invalid stored data from cookies only
          clearAuthCookiesOnClient()
        }
      } else {
        console.log('AuthContext: No valid stored auth data found')
      }
    } catch (error) {
      console.error('AuthContext: Error during auth check:', error)
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
      console.log('AuthContext: Authentication check completed')
    }
  }, [])

  const login = (customer: Customer, token: string) => {
    setCustomer(customer)
    setToken(token)
    // Store only in cookies - no localStorage
    setAuthCookiesOnClient(token, customer)
  }

  const logout = () => {
    setCustomer(null)
    setToken(null)
    // Clear only from cookies - no localStorage
    clearAuthCookiesOnClient()
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
