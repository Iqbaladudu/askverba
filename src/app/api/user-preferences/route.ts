import { NextRequest, NextResponse } from 'next/server'
import { userPreferencesAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id

    const result = await userPreferencesAPI.get(customerId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-preferences GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await userPreferencesAPI.create(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-preferences POST:', error)
    return NextResponse.json(
      { error: 'Failed to create user preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, data } = body
    
    const result = await userPreferencesAPI.upsert(customerId, data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-preferences PUT:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    )
  }
}
