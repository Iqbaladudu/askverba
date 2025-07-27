import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import { getWordsForPractice } from '@/lib/services/vocabularyService'
import { z } from 'zod'

const StartPracticeSchema = z.object({
  sessionType: z.enum(['flashcard', 'multiple_choice', 'fill_blanks', 'listening', 'mixed']),
  wordCount: z.number().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  status: z.enum(['new', 'learning', 'mastered']).optional(),
  includeDefinitions: z.boolean().default(true),
  includeExamples: z.boolean().default(false),
  shuffleWords: z.boolean().default(true),
  timeLimit: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = StartPracticeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const config = validationResult.data

    // Get words for practice
    const words = await getWordsForPractice(user.id, {
      limit: config.wordCount,
      difficulty: config.difficulty,
      status: config.status,
      prioritizeWeak: true,
    })

    if (words.length === 0) {
      return NextResponse.json(
        { error: 'No vocabulary words found for practice. Please add some words first.' },
        { status: 404 }
      )
    }

    // Shuffle words if requested
    const practiceWords = config.shuffleWords 
      ? words.sort(() => Math.random() - 0.5)
      : words

    // Take only the requested number of words
    const selectedWords = practiceWords.slice(0, config.wordCount)

    return NextResponse.json({
      success: true,
      words: selectedWords,
      config: {
        sessionType: config.sessionType,
        includeDefinitions: config.includeDefinitions,
        includeExamples: config.includeExamples,
        timeLimit: config.timeLimit,
        shuffleWords: config.shuffleWords,
      },
      message: `Found ${selectedWords.length} words for practice`
    })

  } catch (error) {
    console.error('Error starting practice session:', error)
    return NextResponse.json(
      { error: 'Failed to start practice session' },
      { status: 500 }
    )
  }
}
