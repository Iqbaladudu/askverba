'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { setAuthCookies } from '@/lib/auth/server-cookies'
import { ActionResult, createActionResult, handleActionError } from '@/shared/types/action'
import { validateInput } from '@/shared/utils/validation'
import { loginSchema, type LoginInput } from '../types/validation'
import type { Customer } from '../types'

type LoginResult = {
  customer: Customer
  token: string
}

export async function loginCustomerAction(input: unknown): Promise<ActionResult<LoginResult>> {
  try {
    // Validate input
    const validation = validateInput(loginSchema, input)
    if (!validation.success) {
      return validation.result
    }

    const payload = await getPayload({ config })

    // Attempt to login using Payload's auth
    const result = await payload.login({
      collection: 'customers',
      data: {
        email: validation.data.email.toLowerCase(),
        password: validation.data.password,
      },
    })

    if (result.user) {
      const customer: Customer = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      }

      // Set cookies on server-side for better security
      await setAuthCookies(result.token!, customer)

      // Return safe customer data (without password)
      return createActionResult(true, {
        customer,
        token: result.token!,
      })
    } else {
      return createActionResult(false, undefined, 'Invalid email or password')
    }
  } catch (error: any) {
    // Handle specific Payload auth errors
    if (
      error.message?.includes('Invalid login credentials') ||
      error.message?.includes('User not found')
    ) {
      return createActionResult(false, undefined, 'Invalid email or password')
    }

    if (error.message?.includes('Account locked')) {
      return createActionResult(
        false,
        undefined,
        'Account temporarily locked due to too many failed attempts. Please try again later.',
      )
    }

    return handleActionError(error)
  }
}
