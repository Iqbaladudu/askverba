'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectTo,
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        const loginUrl = redirectTo || '/login'
        const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(pathname)}`
        router.push(redirectUrl)
        return
      }

      if (!requireAuth && isAuthenticated) {
        // User is authenticated but accessing guest-only page
        const redirectPath = searchParams.get('redirect') || '/dashboard'
        router.push(redirectPath)
        return
      }

      setIsChecking(false)
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, searchParams, redirectTo])

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Checking authentication...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your session
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If we reach here, authentication check passed
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  if (!requireAuth && isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function ProtectedRoute({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function GuestOnlyRoute({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <AuthGuard requireAuth={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Loading fallback component for better UX
export function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/30">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <LoadingSpinner size="xl" color="primary" />
          <div className="absolute inset-0 animate-ping">
            <LoadingSpinner size="xl" color="primary" className="opacity-20" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Authenticating...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm">
            We're verifying your credentials and setting up your session
          </p>
        </div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
