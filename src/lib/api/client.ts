/**
 * Centralized API client with Next.js best practices
 * Handles authentication, error handling, and request optimization
 */

import { getAuthTokenHybrid } from '@/lib/auth-cookies'
import { withApiRetry } from '@/lib/error/retry-strategy'
import { PerformanceMonitor } from '@/lib/monitoring/performance'
import { log } from '@/lib/monitoring/logger'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const API_TIMEOUT = 30000 // 30 seconds

// Request types
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    fromCache?: boolean
    processingTime?: number
  }
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

/**
 * Generate cache key for request deduplication
 */
function generateRequestKey(url: string, config: ApiRequestConfig): string {
  const method = config.method || 'GET'
  const body = config.body ? JSON.stringify(config.body) : ''
  return `${method}:${url}:${body}`
}

/**
 * Enhanced fetch with authentication, error handling, and deduplication
 */
export async function apiClient<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = API_TIMEOUT, cache, next } = config

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  // Generate request key for deduplication
  const requestKey = generateRequestKey(url, config)

  // Check for pending request (deduplication)
  if (pendingRequests.has(requestKey)) {
    log.cache.hit(requestKey, 'deduplication')
    return pendingRequests.get(requestKey)!
  }

  // Create the request promise with retry strategy
  const requestPromise = withApiRetry(() =>
    executeRequest<T>(url, {
      method,
      headers,
      body,
      timeout,
      cache,
      next,
    }),
  )

  // Store in pending requests for deduplication
  pendingRequests.set(requestKey, requestPromise)

  try {
    const result = await requestPromise
    return result
  } finally {
    // Clean up pending request
    pendingRequests.delete(requestKey)
  }
}

/**
 * Execute the actual HTTP request
 */
async function executeRequest<T>(url: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
  const startTime = Date.now()

  try {
    // Get authentication token
    const token = getAuthTokenHybrid()

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    // Add authentication if token exists
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: config.method,
      headers: requestHeaders,
      cache: config.cache,
      next: config.next,
    }

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      fetchOptions.body =
        typeof config.body === 'string' ? config.body : JSON.stringify(config.body)
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    fetchOptions.signal = controller.signal

    // Log API request
    log.api.request(config.method || 'GET', url, {
      headers: requestHeaders,
      body: config.body,
    })

    // Execute request
    const response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)

    const processingTime = Date.now() - startTime

    // Log API response
    log.api.response(config.method || 'GET', url, response.status, processingTime)

    // Track performance metrics
    PerformanceMonitor.trackApiCall(config.method || 'GET', url, processingTime, response.status, {
      cacheHit: false, // Will be updated if from cache
    })

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code,
        errorData.details,
      )

      // Log API error
      log.api.error(config.method || 'GET', url, apiError, {
        status: response.status,
        errorData,
      })

      throw apiError
    }

    const data = await response.json()

    return {
      data: data.data || data,
      success: data.success !== false,
      error: data.error,
      meta: {
        ...data.meta,
        processingTime,
        fromCache: data.fromCache || false,
      },
    }
  } catch (error) {
    const processingTime = Date.now() - startTime

    if (error instanceof ApiError) {
      // Already logged in response handling
      throw error
    }

    let apiError: ApiError
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        apiError = new ApiError('Request timeout', 408, 'TIMEOUT')
      } else {
        apiError = new ApiError(error.message || 'Network error', 0, 'NETWORK_ERROR')
      }
    } else {
      apiError = new ApiError('Unknown error', 500, 'UNKNOWN_ERROR')
    }

    // Log network/timeout errors
    log.api.error(config.method || 'GET', url, apiError, {
      processingTime,
      originalError: error,
    })

    throw apiError
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>) =>
    apiClient<T>(endpoint, { ...config, method: 'GET' }),

  post: <T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>,
  ) => apiClient<T>(endpoint, { ...config, method: 'POST', body }),

  put: <T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>,
  ) => apiClient<T>(endpoint, { ...config, method: 'PUT', body }),

  patch: <T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>,
  ) => apiClient<T>(endpoint, { ...config, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>) =>
    apiClient<T>(endpoint, { ...config, method: 'DELETE' }),
}

/**
 * Clear all pending requests (useful for cleanup)
 */
export function clearPendingRequests(): void {
  pendingRequests.clear()
}
