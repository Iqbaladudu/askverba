import { NextRequest, NextResponse } from 'next/server'
import { practiceAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id

    const result = await practiceAPI.getStats(customerId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in practice-sessions stats GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch practice session stats' },
      { status: 500 }
    )
  }
}
