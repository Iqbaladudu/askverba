// Cleanup localStorage from old authentication data
// This should be called once to migrate from localStorage to cookies-only approach

export function cleanupOldAuthStorage(): void {
  if (typeof window === 'undefined') return

  try {
    // Remove old authentication data from localStorage
    const keysToRemove = ['auth-token', 'auth-customer']
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removing old localStorage key: ${key}`)
        localStorage.removeItem(key)
      }
    })
    
    console.log('✅ Old authentication storage cleaned up')
  } catch (error) {
    console.error('Error cleaning up old storage:', error)
  }
}

// Check if there's any old localStorage data that needs cleanup
export function hasOldAuthStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return !!(localStorage.getItem('auth-token') || localStorage.getItem('auth-customer'))
  } catch (error) {
    return false
  }
}
