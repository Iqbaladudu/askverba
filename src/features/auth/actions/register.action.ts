'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { ActionResult, createActionResult, handleActionError } from '@/shared/types/action'
import { validateInput } from '@/shared/utils/validation'
import { registerSchema, type RegisterInput } from '../types/validation'
import type { Customer } from '../types'

export async function registerCustomerAction(input: unknown): Promise<ActionResult<Customer>> {
  try {
    // Validate input
    const validation = validateInput(registerSchema, input)
    if (!validation.success) {
      return validation.result
    }

    const payload = await getPayload({ config })

    // Check if email already exists
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: validation.data.email.toLowerCase(),
        },
      },
    })

    if (existingCustomer.docs.length > 0) {
      return createActionResult(false, undefined, 'Email address already exists')
    }

    // Create the customer with authentication
    const customer = await payload.create({
      collection: 'customers',
      data: {
        name: validation.data.name,
        email: validation.data.email.toLowerCase(),
        password: validation.data.password,
      },
    })

    // Return safe customer data (without password)
    const customerData: Customer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }

    return createActionResult(true, customerData)
  } catch (error: any) {
    // Handle specific Payload errors
    if (error.name === 'ValidationError') {
      return createActionResult(false, undefined, 'Invalid data provided. Please check your input.')
    }

    if (error.message?.includes('duplicate key')) {
      return createActionResult(false, undefined, 'Email address already exists')
    }

    return handleActionError(error)
  }
}
