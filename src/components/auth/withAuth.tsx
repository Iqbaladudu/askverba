'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface WithAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
  redirectIfAuthenticated?: boolean
}

// Internal component that uses useSearchParams
function AuthenticatedComponentInternal<P extends object>({
  WrappedComponent,
  options,
  props,
}: {
  WrappedComponent: React.ComponentType<P>
  options: WithAuthOptions
  props: P
}) {
  const { redirectTo = '/login', requireAuth = true, redirectIfAuthenticated = false } = options
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        const currentPath = window.location.pathname
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
        return
      }

      if (redirectIfAuthenticated && isAuthenticated) {
        // User is authenticated but shouldn't be (e.g., on login page)
        const redirectPath = searchParams.get('redirect') || '/dashboard'
        router.push(redirectPath)
        return
      }

      setIsChecking(false)
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If we reach here, authentication check passed
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  return <WrappedComponent {...props} />
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        }
      >
        <AuthenticatedComponentInternal
          WrappedComponent={WrappedComponent}
          options={options}
          props={props}
        />
      </Suspense>
    )
  }
}

// Convenience HOCs for common use cases
export const withRequiredAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  withAuth(WrappedComponent, { requireAuth: true })

export const withGuestOnly = <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  withAuth(WrappedComponent, {
    requireAuth: false,
    redirectIfAuthenticated: true,
  })
