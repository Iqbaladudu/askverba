'use server'

import { clearAuthCookies } from '@/lib/auth/server-cookies'
import { ActionResult, createActionResult, handleActionError } from '@/shared/types/action'

export async function logoutCustomerAction(): Promise<ActionResult<void>> {
  try {
    // Clear server-side cookies (main logout action)
    await clearAuthCookies()

    return createActionResult(true)
  } catch (error: unknown) {
    console.error('Logout error:', error)

    // Even if logout fails, we should still try to clear cookies
    try {
      await clearAuthCookies()
    } catch (clearError) {
      console.error('Error clearing cookies:', clearError)
    }

    // Return success to clear client-side auth even if server-side fails
    return createActionResult(true)
  }
}
