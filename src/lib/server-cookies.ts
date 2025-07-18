import { cookies } from 'next/headers'

// Types
interface Customer {
  id: string
  email: string
  name: string
  [key: string]: unknown
}

// Cookie configuration
const COOKIE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60, // 7 days (same as client-side)
  httpOnly: false, // Allow client-side access for authentication state
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'strict' as const,
  path: '/',
}

const TOKEN_COOKIE = 'auth-token'
const CUSTOMER_COOKIE = 'auth-customer'

// Server-side cookie utilities (for Server Components, Server Actions, Middleware)
export async function getAuthTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(TOKEN_COOKIE)?.value || null
  } catch (error) {
    console.error('Error reading auth token from cookies:', error)
    return null
  }
}

export async function getCustomerFromCookies(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies()
    const customerData = cookieStore.get(CUSTOMER_COOKIE)?.value
    return customerData ? JSON.parse(customerData) : null
  } catch (error) {
    console.error('Error reading customer from cookies:', error)
    return null
  }
}

export async function setAuthCookies(token: string, customer: Customer): Promise<void> {
  try {
    const cookieStore = await cookies()

    cookieStore.set(TOKEN_COOKIE, token, COOKIE_CONFIG)
    cookieStore.set(CUSTOMER_COOKIE, JSON.stringify(customer), COOKIE_CONFIG)
  } catch (error) {
    console.error('Error setting auth cookies:', error)
  }
}

export async function clearAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies()

    cookieStore.delete(TOKEN_COOKIE)
    cookieStore.delete(CUSTOMER_COOKIE)
  } catch (error) {
    console.error('Error clearing auth cookies:', error)
  }
}

// Aliases for server actions compatibility
export const setAuthCookiesOnServer = setAuthCookies
export const clearAuthCookiesOnServer = clearAuthCookies
