import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/features/auth/actions'
import { createPracticeSession } from '@/features/practice'
import { PracticeSessionCreateSchema } from '@/utils/api/validation'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('=== PRACTICE SESSION API ===')
    console.log('User ID:', user.id)
    console.log('Received practice session data:', JSON.stringify(body, null, 2))

    // Validate request body
    const validationResult = PracticeSessionCreateSchema.safeParse({
      ...body,
      customer: user.id,
    })

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors)
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const sessionData = validationResult.data
    console.log('Validated session data:', JSON.stringify(sessionData, null, 2))

    // Create practice session
    const session = await createPracticeSession(user.id, {
      sessionType: sessionData.sessionType,
      words: sessionData.words,
      score: sessionData.score,
      timeSpent: sessionData.timeSpent,
      difficulty: sessionData.difficulty,
      metadata: sessionData.metadata,
    })

    console.log('Practice session created successfully:', session.id)

    return NextResponse.json({
      success: true,
      session,
      message: 'Practice session created successfully',
    })
  } catch (error) {
    console.error('Error creating practice session:', error)
    return NextResponse.json({ error: 'Failed to create practice session' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const sessionType = searchParams.get('sessionType')

    // Get user's practice sessions
    const { getUserPracticeSessions } = await import('@/features/practice/services/practiceService')

    const sessions = await getUserPracticeSessions(user.id, {
      limit,
      page,
      sessionType: sessionType as
        | 'flashcard'
        | 'multiple_choice'
        | 'fill_blanks'
        | 'listening'
        | 'mixed'
        | undefined,
    })

    return NextResponse.json({
      success: true,
      ...sessions,
    })
  } catch (error) {
    console.error('Error fetching practice sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch practice sessions' }, { status: 500 })
  }
}
