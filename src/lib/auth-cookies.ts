// Cookie configuration
const TOKEN_COOKIE = 'auth-token'
const CUSTOMER_COOKIE = 'auth-customer'

// Client-side cookie utilities (for Client Components)
export function getAuthTokenFromDocument(): string | null {
  if (typeof document === 'undefined') return null

  try {
    const cookies = document.cookie.split(';')
    if (process.env.NODE_ENV === 'development') {
      console.log('getAuthTokenFromDocument: All cookies:', cookies)
    }
    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith(`${TOKEN_COOKIE}=`))
    if (process.env.NODE_ENV === 'development') {
      console.log('getAuthTokenFromDocument: Token cookie found:', !!tokenCookie)
    }
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1]
      const decodedToken = token ? decodeURIComponent(token) : null
      if (process.env.NODE_ENV === 'development') {
        console.log('getAuthTokenFromDocument: Token extracted:', !!decodedToken)
      }
      return decodedToken
    }
    return null
  } catch (error) {
    console.error('Error reading auth token from document:', error)
    return null
  }
}

export function getCustomerFromDocument(): any | null {
  if (typeof document === 'undefined') return null

  try {
    const cookies = document.cookie.split(';')
    if (process.env.NODE_ENV === 'development') {
      console.log('getCustomerFromDocument: All cookies:', cookies)
    }
    const customerCookie = cookies.find((cookie) => cookie.trim().startsWith(`${CUSTOMER_COOKIE}=`))
    if (process.env.NODE_ENV === 'development') {
      console.log('getCustomerFromDocument: Customer cookie found:', !!customerCookie)
    }

    if (customerCookie) {
      const customerData = customerCookie.split('=')[1]
      const parsedCustomer = JSON.parse(decodeURIComponent(customerData))
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'getCustomerFromDocument: Customer parsed:',
          !!parsedCustomer,
          parsedCustomer?.email,
        )
      }
      return parsedCustomer
    }
    return null
  } catch (error) {
    console.error('Error reading customer from document:', error)
    return null
  }
}

export function setAuthCookiesOnClient(token: string, customer: any): void {
  if (typeof document === 'undefined') return

  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const cookieOptions = `expires=${expires.toUTCString()}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'secure; ' : ''
    }samesite=strict`

    document.cookie = `${TOKEN_COOKIE}=${token}; ${cookieOptions}`
    document.cookie = `${CUSTOMER_COOKIE}=${encodeURIComponent(JSON.stringify(customer))}; ${cookieOptions}`
  } catch (error) {
    console.error('Error setting auth cookies on client:', error)
  }
}

export function clearAuthCookiesOnClient(): void {
  if (typeof document === 'undefined') return

  try {
    document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${CUSTOMER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  } catch (error) {
    console.error('Error clearing auth cookies on client:', error)
  }
}

// Pure cookie approach - no localStorage fallback
export function getAuthTokenHybrid(): string | null {
  // Only use cookies - no localStorage
  return getAuthTokenFromDocument()
}

export function getCustomerHybrid(): any | null {
  // Only use cookies - no localStorage
  return getCustomerFromDocument()
}
