/**
 * Security middleware for API routes
 * Provides rate limiting, input validation, and security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, identifiers } from './rate-limiter'
import { log } from '@/lib/monitoring/logger'
import { PerformanceMonitor } from '@/lib/monitoring/performance'

// Types
export interface SecurityConfig {
  rateLimit?: {
    enabled: boolean
    strategy?: 'user' | 'ip' | 'both'
    skipSuccessful?: boolean
  }
  cors?: {
    enabled: boolean
    origins?: string[]
    methods?: string[]
    headers?: string[]
  }
  headers?: {
    enabled: boolean
    csp?: string
    hsts?: boolean
  }
  validation?: {
    enabled: boolean
    maxBodySize?: number
    allowedContentTypes?: string[]
  }
}

// Default security configuration
const DEFAULT_CONFIG: SecurityConfig = {
  rateLimit: {
    enabled: true,
    strategy: 'both',
    skipSuccessful: false,
  },
  cors: {
    enabled: true,
    origins: process.env.NODE_ENV === 'production' 
      ? [process.env.NEXT_PUBLIC_APP_URL || 'https://askverba.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  headers: {
    enabled: true,
    csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    hsts: true,
  },
  validation: {
    enabled: true,
    maxBodySize: 10 * 1024 * 1024, // 10MB
    allowedContentTypes: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
  },
}

/**
 * Security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<SecurityConfig> = {}
) {
  const securityConfig = { ...DEFAULT_CONFIG, ...config }

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const method = request.method
    const url = request.url
    const ip = identifiers.getIP(request)
    const userAgent = identifiers.getUserAgent(request)

    try {
      // Log incoming request
      log.api.request(method, url, {
        ip,
        userAgent: userAgent.substring(0, 100),
      })

      // 1. Handle CORS preflight
      if (method === 'OPTIONS') {
        return handleCORS(request, securityConfig.cors!)
      }

      // 2. Apply security headers
      const response = await applySecurityHeaders(request, securityConfig.headers!)

      // 3. Validate request
      if (securityConfig.validation?.enabled) {
        const validationResult = await validateRequest(request, securityConfig.validation)
        if (!validationResult.valid) {
          return NextResponse.json(
            { error: validationResult.error },
            { status: 400 }
          )
        }
      }

      // 4. Apply rate limiting
      if (securityConfig.rateLimit?.enabled) {
        const rateLimitResult = await applyRateLimit(request, securityConfig.rateLimit)
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': rateLimitResult.totalHits.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              }
            }
          )
        }

        // Add rate limit headers to response
        response.headers.set('X-RateLimit-Limit', rateLimitResult.totalHits.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
      }

      // 5. Execute the actual handler
      const handlerResponse = await handler(request)

      // 6. Apply CORS headers to response
      if (securityConfig.cors?.enabled) {
        applyCORSHeaders(handlerResponse, request, securityConfig.cors)
      }

      // 7. Apply security headers to response
      if (securityConfig.headers?.enabled) {
        applyResponseSecurityHeaders(handlerResponse, securityConfig.headers)
      }

      // 8. Track performance
      const processingTime = Date.now() - startTime
      PerformanceMonitor.trackApiCall(
        method,
        new URL(url).pathname,
        processingTime,
        handlerResponse.status
      )

      return handlerResponse

    } catch (error) {
      const processingTime = Date.now() - startTime
      
      log.api.error(method, url, error as Error, {
        ip,
        userAgent,
        processingTime,
      })

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: NextRequest, corsConfig: NonNullable<SecurityConfig['cors']>): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = corsConfig.origins || []

  if (origin && !allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
    return new NextResponse(null, { status: 403 })
  }

  const response = new NextResponse(null, { status: 200 })
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  response.headers.set('Access-Control-Allow-Methods', corsConfig.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', corsConfig.headers?.join(', ') || 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  return response
}

/**
 * Apply CORS headers to response
 */
function applyCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  corsConfig: NonNullable<SecurityConfig['cors']>
): void {
  const origin = request.headers.get('origin')
  const allowedOrigins = corsConfig.origins || []

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
}

/**
 * Apply security headers
 */
function applySecurityHeaders(
  request: NextRequest,
  headersConfig: NonNullable<SecurityConfig['headers']>
): Promise<NextResponse> {
  // This is a placeholder - in real implementation, you might want to
  // create a response early or modify the request
  return Promise.resolve(new NextResponse())
}

/**
 * Apply security headers to response
 */
function applyResponseSecurityHeaders(
  response: NextResponse,
  headersConfig: NonNullable<SecurityConfig['headers']>
): void {
  // Content Security Policy
  if (headersConfig.csp) {
    response.headers.set('Content-Security-Policy', headersConfig.csp)
  }

  // HTTP Strict Transport Security
  if (headersConfig.hsts && process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

/**
 * Validate request
 */
async function validateRequest(
  request: NextRequest,
  validationConfig: NonNullable<SecurityConfig['validation']>
): Promise<{ valid: boolean; error?: string }> {
  // Check content type
  const contentType = request.headers.get('content-type')
  if (contentType && validationConfig.allowedContentTypes) {
    const isAllowed = validationConfig.allowedContentTypes.some(allowed =>
      contentType.includes(allowed)
    )
    if (!isAllowed) {
      return { valid: false, error: 'Invalid content type' }
    }
  }

  // Check body size
  if (validationConfig.maxBodySize && request.body) {
    try {
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > validationConfig.maxBodySize) {
        return { valid: false, error: 'Request body too large' }
      }
    } catch (error) {
      log.warn('Failed to check content length', 'VALIDATION', { error })
    }
  }

  return { valid: true }
}

/**
 * Apply rate limiting
 */
async function applyRateLimit(
  request: NextRequest,
  rateLimitConfig: NonNullable<SecurityConfig['rateLimit']>
) {
  const ip = identifiers.getIP(request)
  const endpoint = new URL(request.url).pathname

  // Check IP-based rate limit
  if (rateLimitConfig.strategy === 'ip' || rateLimitConfig.strategy === 'both') {
    const ipResult = await rateLimiter.checkIPLimit(ip, endpoint)
    if (!ipResult.allowed) {
      return ipResult
    }
  }

  // Check user-based rate limit (if authenticated)
  if (rateLimitConfig.strategy === 'user' || rateLimitConfig.strategy === 'both') {
    // Extract user ID from token/session
    const userId = await extractUserId(request)
    if (userId) {
      const userResult = await rateLimiter.checkUserLimit(userId, endpoint)
      if (!userResult.allowed) {
        return userResult
      }
    }
  }

  // Return success result
  return {
    allowed: true,
    remaining: 100,
    resetTime: Date.now() + 60000,
    totalHits: 1,
  }
}

/**
 * Extract user ID from request (implement based on your auth system)
 */
async function extractUserId(request: NextRequest): Promise<string | null> {
  try {
    // This is a placeholder - implement based on your authentication system
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // Decode JWT or validate session token
      // Return user ID if valid
      return null
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Convenience function for API routes
 */
export function secureApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<SecurityConfig>
) {
  return withSecurity(handler, {
    rateLimit: { enabled: true, strategy: 'both' },
    cors: { enabled: true },
    headers: { enabled: true },
    validation: { enabled: true },
    ...config,
  })
}

/**
 * Convenience function for public API routes (less restrictive)
 */
export function publicApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<SecurityConfig>
) {
  return withSecurity(handler, {
    rateLimit: { enabled: true, strategy: 'ip' },
    cors: { enabled: true },
    headers: { enabled: true },
    validation: { enabled: true },
    ...config,
  })
}
