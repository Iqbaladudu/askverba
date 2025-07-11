'use server'

import { clearAuthCookies } from '@/lib/server-cookies'

type LogoutCustomerResult = {
  success: boolean
  error?: string
}

export async function logoutCustomerAction(): Promise<LogoutCustomerResult> {
  try {
    // Clear server-side cookies (main logout action)
    await clearAuthCookies()

    return {
      success: true,
    }
  } catch (error: unknown) {
    console.error('Logout error:', error)

    // Even if logout fails, we should still try to clear cookies
    try {
      await clearAuthCookies()
    } catch (clearError) {
      console.error('Error clearing cookies:', clearError)
    }

    return {
      success: true, // Return success to clear client-side auth
    }
  }
}
