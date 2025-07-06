'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

type LoginCustomerInput = {
  email: string
  password: string
}

type LoginCustomerResult = {
  success: boolean
  customer?: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
  token?: string
  error?: string
}

export async function loginCustomerAction(
  input: LoginCustomerInput,
): Promise<LoginCustomerResult> {
  try {
    const payload = await getPayload({ config })

    // Attempt to login using Payload's auth
    const result = await payload.login({
      collection: 'customers',
      data: {
        email: input.email.toLowerCase(),
        password: input.password,
      },
    })

    if (result.user) {
      // Return safe customer data (without password)
      return {
        success: true,
        customer: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        token: result.token,
      }
    } else {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }
  } catch (error: any) {
    console.error('Login error:', error)

    // Handle specific Payload auth errors
    if (error.message?.includes('Invalid login credentials')) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    if (error.message?.includes('Account locked')) {
      return {
        success: false,
        error: 'Account temporarily locked due to too many failed attempts. Please try again later.',
      }
    }

    if (error.message?.includes('User not found')) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    return {
      success: false,
      error: error?.message || 'Login failed. Please try again.',
    }
  }
}
