import { NextRequest, NextResponse } from 'next/server'
import { userPreferencesAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await userPreferencesAPI.update(params.id, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-preferences PATCH:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    )
  }
}
