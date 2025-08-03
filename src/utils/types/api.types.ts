/**
 * Core API Types
 * Shared type definitions for API requests and responses
 */

import { ERROR_CODES } from '../constants/errors'

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

// API error structure
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  field?: string
  timestamp: string
  requestId?: string
}

// API metadata for pagination and additional info
export interface ApiMeta {
  pagination?: PaginationMeta
  processingTime?: number
  fromCache?: boolean
  version?: string
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Pagination query parameters
export interface PaginationQuery {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Search query parameters
export interface SearchQuery extends PaginationQuery {
  q?: string
  filters?: Record<string, unknown>
}

// Base entity with common fields
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Request context for API operations
export interface RequestContext {
  userId?: string
  userRole?: string
  requestId: string
  timestamp: string
  userAgent?: string
  ip?: string
}

// API operation result
export interface OperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// Batch operation request
export interface BatchRequest<T = unknown> {
  operations: T[]
  options?: {
    continueOnError?: boolean
    validateAll?: boolean
  }
}

// Batch operation response
export interface BatchResponse<T = unknown> {
  results: OperationResult<T>[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}

// File upload types
export interface FileUpload {
  filename: string
  mimetype: string
  size: number
  buffer: Buffer
}

export interface UploadResponse {
  id: string
  filename: string
  url: string
  size: number
  mimetype: string
}

// API endpoint configuration
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  requiresAuth?: boolean
  rateLimit?: {
    max: number
    windowMs: number
  }
  validation?: {
    body?: unknown
    query?: unknown
    params?: unknown
  }
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// API client configuration
export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  auth?: {
    type: 'bearer' | 'basic' | 'cookie'
    token?: string
    credentials?: {
      username: string
      password: string
    }
  }
}

// Request options for API client
export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, unknown>
  timeout?: number
  retries?: number
  cache?: boolean
}

// API response with full HTTP information
export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestOptions
}

// Error response from API
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  status: number
  timestamp: string
  path: string
  requestId?: string
}

// Success response wrapper
export type SuccessResponse<T> = ApiResponse<T> & {
  success: true
  data: T
}

// Error response wrapper
export type FailureResponse = ApiResponse<never> & {
  success: false
  error: ApiError
}

// Union type for all API responses
export type ApiResult<T> = SuccessResponse<T> | FailureResponse

// Type guards for API responses
export const isSuccessResponse = <T>(response: ApiResult<T>): response is SuccessResponse<T> => {
  return response.success === true
}

export const isFailureResponse = <T>(response: ApiResult<T>): response is FailureResponse => {
  return response.success === false
}

// Utility types for API operations
export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateRequest<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
export type PatchRequest<T> = Partial<T>

// Query builder types
export interface QueryFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'exists'
  value: unknown
}

export interface QueryOptions {
  filters?: QueryFilter[]
  sort?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  pagination?: {
    page: number
    limit: number
  }
  include?: string[]
  exclude?: string[]
}

// Webhook types
export interface WebhookPayload<T = unknown> {
  event: string
  data: T
  timestamp: string
  signature?: string
}

export interface WebhookConfig {
  url: string
  events: string[]
  secret?: string
  active: boolean
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// Cache types
export interface CacheOptions {
  ttl?: number
  key?: string
  tags?: string[]
  invalidateOn?: string[]
}

// API versioning
export interface ApiVersion {
  version: string
  deprecated?: boolean
  sunsetDate?: string
  migrationGuide?: string
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: Record<string, {
    status: 'up' | 'down' | 'degraded'
    responseTime?: number
    error?: string
  }>
}

// Export utility functions
export const ApiUtils = {
  /**
   * Create a success response
   */
  success: <T>(data: T, meta?: ApiMeta): SuccessResponse<T> => ({
    success: true,
    data,
    meta,
  }),

  /**
   * Create an error response
   */
  error: (code: string, message: string, details?: Record<string, unknown>): FailureResponse => ({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  }),

  /**
   * Create pagination metadata
   */
  createPaginationMeta: (
    page: number,
    limit: number,
    total: number
  ): PaginationMeta => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  }),
} as const

export default {
  Utils: ApiUtils,
  isSuccessResponse,
  isFailureResponse,
}
