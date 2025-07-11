'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

type RegisterCustomerInput = {
  name: string
  email: string
  password: string
}

type RegisterCustomerResult = {
  success: boolean
  customer?: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
  error?: string
}

export async function registerCustomerAction(
  input: RegisterCustomerInput,
): Promise<RegisterCustomerResult> {
  try {
    const payload = await getPayload({ config })

    // Check if email already exists
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: input.email.toLowerCase(),
        },
      },
    })

    if (existingCustomer.docs.length > 0) {
      return {
        success: false,
        error: 'Email address already exists',
      }
    }

    // Create the customer with authentication
    const customer = await payload.create({
      collection: 'customers',
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: input.password,
      },
    })

    // Return safe customer data (without password)
    return {
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    }
  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle specific Payload errors
    if (error.name === 'ValidationError') {
      return {
        success: false,
        error: 'Invalid data provided. Please check your input.',
      }
    }

    if (error.message?.includes('duplicate key')) {
      return {
        success: false,
        error: 'Email address already exists',
      }
    }

    return {
      success: false,
      error: error?.message || 'Registration failed. Please try again.',
    }
  }
}
