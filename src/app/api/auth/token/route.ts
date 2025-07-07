import { NextRequest, NextResponse } from 'next/server'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()
    
    if (!token || !customer) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      token,
      customer,
      authenticated: true
    })
  } catch (error) {
    console.error('Error getting auth token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
