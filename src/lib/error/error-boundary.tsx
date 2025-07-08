/**
 * Enhanced Error Boundary with retry functionality and error reporting
 * Provides graceful error handling for React components
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// Types
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  maxRetries?: number
  showErrorDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

// Error reporting utility
class ErrorReporter {
  static report(error: Error, errorInfo: ErrorInfo, errorId: string, level: string = 'component') {
    const errorReport = {
      errorId,
      level,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary - ${level.toUpperCase()}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error ID:', errorId)
      console.groupEnd()
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorReport })
      console.error('Production Error:', errorReport)
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorReport)
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError)
    }
  }

  static getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]')
    } catch {
      return []
    }
  }

  static clearStoredErrors(): void {
    try {
      localStorage.removeItem('app_errors')
    } catch (error) {
      console.warn('Failed to clear stored errors:', error)
    }
  }
}

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  errorId, 
  retryCount, 
  maxRetries, 
  onRetry, 
  onGoHome,
  showErrorDetails = false,
  level = 'component'
}: {
  error: Error
  errorId: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onGoHome: () => void
  showErrorDetails?: boolean
  level?: string
}) {
  const canRetry = retryCount < maxRetries

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {level === 'critical' ? 'Critical Error' : 'Something went wrong'}
        </h2>
        <p className="text-gray-600 mb-4">
          {level === 'critical' 
            ? 'A critical error occurred that prevents the application from functioning properly.'
            : 'We encountered an unexpected error. Please try again or contact support if the problem persists.'
          }
        </p>
        
        {showErrorDetails && (
          <details className="text-left bg-gray-100 p-4 rounded-lg mb-4 max-w-md">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details
            </summary>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <strong>Error ID:</strong> {errorId}
              </div>
              <div>
                <strong>Message:</strong> {error.message}
              </div>
              {retryCount > 0 && (
                <div>
                  <strong>Retry Count:</strong> {retryCount}/{maxRetries}
                </div>
              )}
            </div>
          </details>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {canRetry && (
          <Button 
            onClick={onRetry}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        
        <Button 
          onClick={onGoHome}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <Button 
            onClick={() => {
              console.log('Stored Errors:', ErrorReporter.getStoredErrors())
            }}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Bug className="w-4 h-4" />
            Debug
          </Button>
        )}
      </div>
    </div>
  )
}

// Enhanced Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props
    const errorId = this.state.errorId || generateErrorId()

    this.setState({
      errorInfo,
      errorId,
    })

    // Report error
    ErrorReporter.report(error, errorInfo, errorId, level)

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo, errorId)
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError)
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      console.warn('Max retries reached, cannot retry')
      return
    }

    console.log(`Retrying... (${retryCount + 1}/${maxRetries})`)

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleGoHome = () => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: '',
    })

    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    const { hasError, error, retryCount, errorId } = this.state
    const { children, fallback, maxRetries = 3, showErrorDetails = false, level = 'component' } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Use default error fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorId={errorId}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showErrorDetails={showErrorDetails}
          level={level}
        />
      )
    }

    return children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    const errorId = generateErrorId()
    
    ErrorReporter.report(
      error, 
      errorInfo || { componentStack: 'Unknown' }, 
      errorId,
      'hook'
    )
    
    return errorId
  }, [])
}

// Utility for manual error reporting
export function reportError(error: Error, context?: string, level: string = 'manual') {
  const errorId = generateErrorId()
  
  ErrorReporter.report(
    error,
    { componentStack: context || 'Manual report' },
    errorId,
    level
  )
  
  return errorId
}

// Export error reporter for external use
export { ErrorReporter }
