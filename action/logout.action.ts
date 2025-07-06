'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

type LogoutCustomerResult = {
  success: boolean
  error?: string
}

export async function logoutCustomerAction(token?: string): Promise<LogoutCustomerResult> {
  try {
    const payload = await getPayload({ config })

    // Logout using Payload's auth
    await payload.logout({
      collection: 'customers',
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('Logout error:', error)
    
    // Even if logout fails on server, we should still clear client-side auth
    return {
      success: true, // Return success to clear client-side auth
    }
  }
}
