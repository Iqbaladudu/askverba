import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/features/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'No authenticated user' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
