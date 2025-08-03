import { NextRequest, NextResponse } from 'next/server'
import { practiceAPI } from '@/utils/api/payload'
import { getCurrentUser } from '@/features/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id
    const limit = parseInt(searchParams.get('limit') || '20')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')

    const options: any = { limit }
    if (difficulty) options.difficulty = difficulty
    if (status) options.status = status

    const result = await practiceAPI.getWordsForPractice(customerId, options)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in vocabulary practice GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch practice words' },
      { status: 500 }
    )
  }
}
