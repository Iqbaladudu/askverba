'use server'

import { clearAuthCookiesOnServer } from '@/lib/server-cookies'

export async function logoutCustomerAction(): Promise<{ success: boolean; error?: string }> {
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
      error: error instanceof Error ? error.message : 'Logout failed' 
    }
  }
}
