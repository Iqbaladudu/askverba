/**
 * Centralized error handling for API operations
 * Provides consistent error handling across the application
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export interface ApiErrorResponse {
  error: string
  code: ErrorCode
  details?: any
  timestamp: string
  path?: string
  requestId?: string
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Handle errors in API routes
 */
export function handleApiError(
  error: unknown,
  path?: string,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  console.error('[API Error]', {
    error,
    path,
    requestId,
    stack: error instanceof Error ? error.stack : undefined,
  })

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: error.errors,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
      { status: 400 }
    )
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
      { status: error.statusCode }
    )
  }

  // Handle Payload CMS errors
  if (error && typeof error === 'object' && 'name' in error) {
    const payloadError = error as any
    
    if (payloadError.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: ErrorCode.VALIDATION_ERROR,
          details: payloadError.data,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 400 }
      )
    }

    if (payloadError.name === 'Forbidden') {
      return NextResponse.json(
        {
          error: 'Access forbidden',
          code: ErrorCode.AUTHORIZATION_ERROR,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 403 }
      )
    }

    if (payloadError.name === 'NotFound') {
      return NextResponse.json(
        {
          error: 'Resource not found',
          code: ErrorCode.NOT_FOUND,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 404 }
      )
    }
  }

  // Handle MongoDB/Database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any
    
    if (dbError.code === 11000) {
      return NextResponse.json(
        {
          error: 'Duplicate entry',
          code: ErrorCode.DATABASE_ERROR,
          details: 'Resource already exists',
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 409 }
      )
    }
  }

  // Handle network/timeout errors
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Request timeout',
          code: ErrorCode.TIMEOUT_ERROR,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 408 }
      )
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
      return NextResponse.json(
        {
          error: 'Network error',
          code: ErrorCode.NETWORK_ERROR,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
        { status: 503 }
      )
    }
  }

  // Default internal server error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path,
      requestId,
    },
    { status: 500 }
  )
}

/**
 * Handle errors in server actions
 */
export function handleServerActionError(error: unknown): never {
  console.error('[Server Action Error]', {
    error,
    stack: error instanceof Error ? error.stack : undefined,
  })

  if (error instanceof AppError) {
    throw error
  }

  if (error instanceof ZodError) {
    throw new AppError(
      'Validation failed',
      ErrorCode.VALIDATION_ERROR,
      400,
      error.errors
    )
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new AppError(
        'Request timeout',
        ErrorCode.TIMEOUT_ERROR,
        408
      )
    }

    throw new AppError(
      error.message || 'Internal server error',
      ErrorCode.INTERNAL_SERVER_ERROR,
      500
    )
  }

  throw new AppError(
    'Unknown error occurred',
    ErrorCode.INTERNAL_SERVER_ERROR,
    500
  )
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  statusCode: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Validation helper for API routes
 */
export function validateRequest<T>(
  schema: any,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        error.errors
      )
    }
    throw error
  }
}

/**
 * Authentication helper for API routes
 */
export function requireAuth(token?: string | null): void {
  if (!token) {
    throw new AppError(
      'Authentication required',
      ErrorCode.AUTHENTICATION_ERROR,
      401
    )
  }
}

/**
 * Rate limiting helper
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60000 // 1 minute
): boolean {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting service
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  // For now, return true (no rate limiting)
  // TODO: Implement proper rate limiting with Redis
  return true
}
