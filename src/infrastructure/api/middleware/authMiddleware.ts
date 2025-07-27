/**
 * Authentication Middleware
 * Handles authentication and authorization for API routes
 */

import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createLogger } from '@/core/utils/logger'
import { ApiError, createAuthError } from './errorHandler'
import { ERROR_CODES } from '@/core/constants/errors'
import { User } from '@/domains/auth/types'

const logger = createLogger('AuthMiddleware')

// Authentication context
export interface AuthContext {
  user: User
  token: string
  requestId: string
}

// Authentication options
export interface AuthOptions {
  required?: boolean
  roles?: string[]
  permissions?: string[]
}

/**
 * Extract token from request headers or cookies
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Validate and decode JWT token
 */
async function validateToken(token: string): Promise<User | null> {
  try {
    const payload = await getPayload({ config })
    
    // Use PayloadCMS auth to validate the token
    const result = await payload.auth({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    })

    if (result.user) {
      return result.user as User
    }

    return null
  } catch (error) {
    logger.debug('Token validation failed', { error: (error as Error).message })
    return null
  }
}

/**
 * Check if user has required role
 */
function hasRequiredRole(user: User, requiredRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  return requiredRoles.includes(user.role)
}

/**
 * Check if user has required permissions
 */
function hasRequiredPermissions(user: User, requiredPermissions: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  // This would be implemented based on your permission system
  // For now, we'll assume all authenticated users have basic permissions
  return true
}

/**
 * Authentication middleware for API routes
 */
export async function authenticate(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthContext | null> {
  const requestId = crypto.randomUUID()
  const { required = true, roles, permissions } = options

  try {
    // Extract token
    const token = extractToken(request)
    
    if (!token) {
      if (required) {
        throw createAuthError(
          ERROR_CODES.AUTH.UNAUTHORIZED,
          'Authentication token is required'
        )
      }
      return null
    }

    // Validate token and get user
    const user = await validateToken(token)
    
    if (!user) {
      if (required) {
        throw createAuthError(
          ERROR_CODES.AUTH.TOKEN_INVALID,
          'Invalid or expired authentication token'
        )
      }
      return null
    }

    // Check role requirements
    if (roles && !hasRequiredRole(user, roles)) {
      throw createAuthError(
        ERROR_CODES.AUTH.FORBIDDEN,
        'Insufficient role permissions'
      )
    }

    // Check permission requirements
    if (permissions && !hasRequiredPermissions(user, permissions)) {
      throw createAuthError(
        ERROR_CODES.AUTH.FORBIDDEN,
        'Insufficient permissions'
      )
    }

    logger.debug('Authentication successful', {
      userId: user.id,
      role: user.role,
      requestId,
    })

    return {
      user,
      token,
      requestId,
    }
  } catch (error) {
    logger.warn('Authentication failed', {
      error: (error as Error).message,
      requestId,
      url: request.url,
      method: request.method,
    })
    
    if (required) {
      throw error
    }
    
    return null
  }
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authContext = await authenticate(request, options)
    
    if (!authContext && options.required !== false) {
      throw createAuthError()
    }

    return handler(request, authContext!, ...args)
  }
}

/**
 * Higher-order function for optional authentication
 */
export function withOptionalAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: AuthContext | null, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authContext = await authenticate(request, { required: false })
    return handler(request, authContext, ...args)
  }
}

/**
 * Role-based access control decorator
 */
export function requireRole(roles: string | string[]) {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  
  return function<T extends unknown[]>(
    handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
  ) {
    return withAuth(handler, { roles: roleArray })
  }
}

/**
 * Permission-based access control decorator
 */
export function requirePermission(permissions: string | string[]) {
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
  
  return function<T extends unknown[]>(
    handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
  ) {
    return withAuth(handler, { permissions: permissionArray })
  }
}

/**
 * Admin-only access decorator
 */
export function requireAdmin<T extends unknown[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
) {
  return withAuth(handler, { roles: ['admin'] })
}

/**
 * User ownership check
 */
export function requireOwnership(
  getResourceUserId: (request: NextRequest, ...args: unknown[]) => Promise<string>
) {
  return function<T extends unknown[]>(
    handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      const authContext = await authenticate(request)
      
      if (!authContext) {
        throw createAuthError()
      }

      // Check if user is admin (admins can access everything)
      if (authContext.user.role === 'admin') {
        return handler(request, authContext, ...args)
      }

      // Check ownership
      const resourceUserId = await getResourceUserId(request, ...args)
      
      if (authContext.user.id !== resourceUserId) {
        throw createAuthError(
          ERROR_CODES.AUTH.FORBIDDEN,
          'You can only access your own resources'
        )
      }

      return handler(request, authContext, ...args)
    }
  }
}

/**
 * Rate limiting by user
 */
export function withUserRateLimit(
  maxRequests: number,
  windowMs: number,
  keyGenerator?: (user: User) => string
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>()
  
  return function<T extends unknown[]>(
    handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      const authContext = await authenticate(request)
      
      if (!authContext) {
        throw createAuthError()
      }

      const key = keyGenerator ? keyGenerator(authContext.user) : authContext.user.id
      const now = Date.now()
      const userLimit = requestCounts.get(key)

      if (userLimit) {
        if (now < userLimit.resetTime) {
          if (userLimit.count >= maxRequests) {
            throw new ApiError(
              ERROR_CODES.API.RATE_LIMIT_EXCEEDED,
              'Rate limit exceeded',
              429,
              { retryAfter: Math.ceil((userLimit.resetTime - now) / 1000) }
            )
          }
          userLimit.count++
        } else {
          // Reset window
          requestCounts.set(key, { count: 1, resetTime: now + windowMs })
        }
      } else {
        // First request
        requestCounts.set(key, { count: 1, resetTime: now + windowMs })
      }

      return handler(request, authContext, ...args)
    }
  }
}

/**
 * Extract user ID from request parameters
 */
export function extractUserIdFromParams(request: NextRequest, ...args: unknown[]): Promise<string> {
  // This would extract user ID from URL parameters
  // Implementation depends on your route structure
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const userIdIndex = pathSegments.findIndex(segment => segment === 'users') + 1
  
  if (userIdIndex > 0 && pathSegments[userIdIndex]) {
    return Promise.resolve(pathSegments[userIdIndex])
  }
  
  throw new ApiError(
    ERROR_CODES.VALIDATION.INVALID_FORMAT,
    'User ID not found in request parameters',
    400
  )
}

export default {
  authenticate,
  withAuth,
  withOptionalAuth,
  requireRole,
  requirePermission,
  requireAdmin,
  requireOwnership,
  withUserRateLimit,
  extractUserIdFromParams,
}
