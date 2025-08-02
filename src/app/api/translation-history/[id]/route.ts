import { NextRequest, NextResponse } from 'next/server'
import { translationHistoryAPI } from '@/infrastructure/api/payload'
import { getCurrentUser } from '@/features/auth/actions'

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
    const result = await translationHistoryAPI.update(params.id, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translation-history PATCH:', error)
    return NextResponse.json(
      { error: 'Failed to update translation history' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await translationHistoryAPI.delete(params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translation-history DELETE:', error)
    return NextResponse.json(
      { error: 'Failed to delete translation history' },
      { status: 500 }
    )
  }
}
