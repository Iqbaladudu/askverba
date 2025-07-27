/**
 * API Error Handler Middleware
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createLogger } from '@/core/utils/logger'
import { ERROR_CODES, ErrorUtils } from '@/core/constants/errors'
import { ApiResponse } from '@/core/types/api.types'

const logger = createLogger('ApiErrorHandler')

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Error response interface
interface ErrorResponse extends ApiResponse<never> {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    field?: string
    timestamp: string
    requestId?: string
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): { response: ErrorResponse; statusCode: number } {
  let code = ERROR_CODES.API.INTERNAL_SERVER_ERROR
  let message = 'An unexpected error occurred'
  let statusCode = 500
  let details: Record<string, unknown> | undefined
  let field: string | undefined

  // Handle different error types
  if (error instanceof ApiError) {
    code = error.code
    message = error.message
    statusCode = error.statusCode
    details = error.details
  } else if (error instanceof ZodError) {
    code = ERROR_CODES.VALIDATION.INVALID_FORMAT
    message = 'Validation failed'
    statusCode = 422
    details = {
      issues: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
    }
    field = error.issues[0]?.path.join('.')
  } else if (error instanceof Error) {
    // Map common error messages to specific codes
    if (error.message.includes('not found')) {
      code = ERROR_CODES.DATABASE.RECORD_NOT_FOUND
      statusCode = 404
    } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      code = ERROR_CODES.DATABASE.DUPLICATE_ENTRY
      statusCode = 409
    } else if (error.message.includes('unauthorized')) {
      code = ERROR_CODES.AUTH.UNAUTHORIZED
      statusCode = 401
    } else if (error.message.includes('forbidden')) {
      code = ERROR_CODES.AUTH.FORBIDDEN
      statusCode = 403
    }
    
    message = error.message
    details = { stack: error.stack }
  }

  // Use error utils to get proper status code if not already set
  if (statusCode === 500) {
    statusCode = ErrorUtils.getHttpStatus(code)
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      field,
      timestamp: new Date().toISOString(),
      requestId,
    },
  }

  return { response, statusCode }
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const requestId = crypto.randomUUID()
      
      // Log the error
      logger.error('API route error', error as Error, {
        requestId,
        args: args.length > 0 && args[0] instanceof NextRequest ? {
          method: (args[0] as NextRequest).method,
          url: (args[0] as NextRequest).url,
          headers: Object.fromEntries((args[0] as NextRequest).headers.entries()),
        } : undefined,
      })

      const { response, statusCode } = createErrorResponse(error, requestId)
      
      return NextResponse.json(response, { status: statusCode })
    }
  }
}

/**
 * Async error handler for server actions
 */
export function withServerActionErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      const requestId = crypto.randomUUID()
      
      // Log the error
      logger.error('Server action error', error as Error, {
        requestId,
        functionName: handler.name,
      })

      // For server actions, we need to return a serializable error
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error instanceof ZodError) {
        throw new ApiError(
          ERROR_CODES.VALIDATION.INVALID_FORMAT,
          'Validation failed',
          422,
          {
            issues: error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            }))
          }
        )
      }

      if (error instanceof Error) {
        throw new ApiError(
          ERROR_CODES.API.INTERNAL_SERVER_ERROR,
          error.message,
          500
        )
      }

      throw new ApiError(
        ERROR_CODES.API.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        500
      )
    }
  }
}

/**
 * Validation error helper
 */
export function createValidationError(
  message: string,
  field?: string,
  details?: Record<string, unknown>
): ApiError {
  return new ApiError(
    ERROR_CODES.VALIDATION.INVALID_FORMAT,
    message,
    422,
    { field, ...details }
  )
}

/**
 * Authentication error helper
 */
export function createAuthError(
  code: string = ERROR_CODES.AUTH.UNAUTHORIZED,
  message: string = 'Authentication required'
): ApiError {
  const statusCode = code === ERROR_CODES.AUTH.FORBIDDEN ? 403 : 401
  return new ApiError(code, message, statusCode)
}

/**
 * Not found error helper
 */
export function createNotFoundError(
  resource: string = 'Resource'
): ApiError {
  return new ApiError(
    ERROR_CODES.DATABASE.RECORD_NOT_FOUND,
    `${resource} not found`,
    404
  )
}

/**
 * Rate limit error helper
 */
export function createRateLimitError(
  retryAfter?: number
): ApiError {
  return new ApiError(
    ERROR_CODES.API.RATE_LIMIT_EXCEEDED,
    'Too many requests. Please try again later.',
    429,
    { retryAfter }
  )
}

/**
 * Business logic error helper
 */
export function createBusinessError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return new ApiError(code, message, 400, details)
}

/**
 * External service error helper
 */
export function createExternalServiceError(
  service: string,
  message: string = 'External service error'
): ApiError {
  return new ApiError(
    ERROR_CODES.EXTERNAL.THIRD_PARTY_API_ERROR,
    `${service}: ${message}`,
    502
  )
}

// Export error types for use in other modules
export { ERROR_CODES } from '@/core/constants/errors'

// Common error instances
export const CommonErrors = {
  UNAUTHORIZED: createAuthError(),
  FORBIDDEN: createAuthError(ERROR_CODES.AUTH.FORBIDDEN, 'Access denied'),
  NOT_FOUND: createNotFoundError(),
  VALIDATION_FAILED: createValidationError('Validation failed'),
  RATE_LIMITED: createRateLimitError(),
  INTERNAL_ERROR: new ApiError(
    ERROR_CODES.API.INTERNAL_SERVER_ERROR,
    'Internal server error',
    500
  ),
} as const

export default {
  ApiError,
  withErrorHandler,
  withServerActionErrorHandler,
  createErrorResponse,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createRateLimitError,
  createBusinessError,
  createExternalServiceError,
  CommonErrors,
}
