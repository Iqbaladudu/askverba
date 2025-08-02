import { NextRequest, NextResponse } from 'next/server'
import { vocabularyAPI } from '@/infrastructure/api/payload'
import { getCurrentUser } from '@/features/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id

    const result = await vocabularyAPI.getStats(customerId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in vocabulary stats GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary stats' },
      { status: 500 }
    )
  }
}
