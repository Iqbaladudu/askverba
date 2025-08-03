import { NextRequest, NextResponse } from 'next/server'
import { translationHistoryAPI } from '@/utils/api/payload'
import { getCurrentUser } from '@/features/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id

    const result = await translationHistoryAPI.getStats(customerId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translation-history stats GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translation history stats' },
      { status: 500 }
    )
  }
}
