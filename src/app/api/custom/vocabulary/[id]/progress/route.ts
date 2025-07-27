import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import { updateVocabularyStats } from '@/lib/services/vocabularyService'
import { z } from 'zod'

const ProgressUpdateSchema = z.object({
  isCorrect: z.boolean(),
  attempts: z.number().min(1),
  timeSpent: z.number().min(0),
  practiceDate: z.string().datetime(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vocabularyId = params.id
    if (!vocabularyId) {
      return NextResponse.json({ error: 'Vocabulary ID is required' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = ProgressUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { isCorrect, attempts, timeSpent, practiceDate } = validationResult.data

    // Update vocabulary statistics
    await updateVocabularyStats(vocabularyId, {
      isCorrect,
      timeSpent,
      attempts,
    })

    // Calculate new status based on performance
    const newStatus = calculateVocabularyStatus(isCorrect, attempts)

    return NextResponse.json({
      success: true,
      message: 'Vocabulary progress updated successfully',
      newStatus,
    })

  } catch (error) {
    console.error('Error updating vocabulary progress:', error)
    return NextResponse.json(
      { error: 'Failed to update vocabulary progress' },
      { status: 500 }
    )
  }
}

function calculateVocabularyStatus(isCorrect: boolean, attempts: number): 'new' | 'learning' | 'mastered' {
  // Simple algorithm for status calculation
  // This can be enhanced with more sophisticated spaced repetition logic
  
  if (attempts === 1) {
    return isCorrect ? 'learning' : 'new'
  }
  
  if (attempts >= 3 && isCorrect) {
    return 'mastered'
  }
  
  if (isCorrect) {
    return 'learning'
  }
  
  return 'new'
}
