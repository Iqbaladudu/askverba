/**
 * Authentication server actions with Next.js best practices
 * Handles login, register, logout with proper validation and error handling
 */

'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleServerActionError, AppError, ErrorCode } from '@/lib/api/error-handler'
import { validateRequest } from '@/lib/api/error-handler'
import { LoginSchema, RegisterSchema } from '@/lib/api/validation'
import { setAuthCookiesOnServer, clearAuthCookiesOnServer } from '@/lib/server-cookies'

// Types
interface AuthResult {
  success: boolean
  customer?: any
  token?: string
  error?: string
}

/**
 * Login action with validation and error handling
 */
export async function loginAction(prevState: any, formData: FormData): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = validateRequest(LoginSchema, {
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const payload = await getPayload({ config })

    // Authenticate user
    const result = await payload.login({
      collection: 'customers',
      data: {
        email: validatedData.email,
        password: validatedData.password,
      },
    })

    if (!result.user || !result.token) {
      throw new AppError('Invalid credentials', ErrorCode.AUTHENTICATION_ERROR, 401)
    }

    // Set authentication cookies
    await setAuthCookiesOnServer(result.token, result.user)

    console.log('Login successful for user:', result.user.email)

    return {
      success: true,
      customer: result.user,
      token: result.token,
    }
  } catch (error) {
    console.error('Login action error:', error)

    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Login failed. Please check your credentials.',
    }
  }
}

/**
 * Register action with validation and error handling
 */
export async function registerAction(prevState: any, formData: FormData): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = validateRequest(RegisterSchema, {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const payload = await getPayload({ config })

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: validatedData.email,
        },
      },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      throw new AppError('User with this email already exists', ErrorCode.VALIDATION_ERROR, 400)
    }

    // Create new user
    const newUser = await payload.create({
      collection: 'customers',
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      },
    })

    // Login the new user
    const loginResult = await payload.login({
      collection: 'customers',
      data: {
        email: validatedData.email,
        password: validatedData.password,
      },
    })

    if (!loginResult.user || !loginResult.token) {
      throw new AppError(
        'Registration successful but login failed',
        ErrorCode.INTERNAL_SERVER_ERROR,
        500,
      )
    }

    // Set authentication cookies
    await setAuthCookiesOnServer(loginResult.token, loginResult.user)

    console.log('Registration successful for user:', loginResult.user.email)

    return {
      success: true,
      customer: loginResult.user,
      token: loginResult.token,
    }
  } catch (error) {
    console.error('Register action error:', error)

    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Registration failed. Please try again.',
    }
  }
}

/**
 * Logout action with proper cleanup
 */
export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear authentication cookies
    await clearAuthCookiesOnServer()

    console.log('Logout successful')

    return { success: true }
  } catch (error) {
    console.error('Logout action error:', error)
    // Don't throw error for logout - always clear cookies
    await clearAuthCookiesOnServer()

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}

/**
 * Get current user from server-side cookies
 */
export async function getCurrentUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    const customerData = cookieStore.get('auth-customer')?.value

    if (!token || !customerData) {
      return null
    }

    // Parse customer data
    const customer = JSON.parse(customerData)

    // Optionally validate token with Payload
    const payload = await getPayload({ config })

    try {
      // Create proper Headers object for PayloadCMS
      const headers = new Headers()
      headers.set('Authorization', `Bearer ${token}`)

      const me = await payload.auth({
        headers,
      })

      if (me.user) {
        return me.user
      }
    } catch (authError) {
      console.warn('Token validation failed:', authError)
      // Clear invalid cookies
      await clearAuthCookiesOnServer()
      return null
    }

    return customer
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Validate authentication token
 */
export async function validateAuthToken(token: string): Promise<boolean> {
  try {
    const payload = await getPayload({ config })

    // Create proper Headers object for PayloadCMS
    const headers = new Headers()
    headers.set('Authorization', `Bearer ${token}`)

    const result = await payload.auth({
      headers,
    })

    return !!result.user
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const currentToken = cookieStore.get('auth-token')?.value

    if (!currentToken) {
      throw new AppError('No token to refresh', ErrorCode.AUTHENTICATION_ERROR, 401)
    }

    const payload = await getPayload({ config })

    // Validate current token and get user
    // Create proper Headers object for PayloadCMS
    const headers = new Headers()
    headers.set('Authorization', `Bearer ${currentToken}`)

    const authResult = await payload.auth({
      headers,
    })

    if (!authResult.user) {
      throw new AppError('Invalid token', ErrorCode.AUTHENTICATION_ERROR, 401)
    }

    // For now, return the same token
    // In a full implementation, you might generate a new token
    return {
      success: true,
      customer: authResult.user,
      token: currentToken,
    }
  } catch (error) {
    console.error('Token refresh error:', error)

    // Clear invalid cookies
    await clearAuthCookiesOnServer()

    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Token refresh failed',
    }
  }
}
