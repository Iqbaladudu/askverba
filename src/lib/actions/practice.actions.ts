/**
 * Practice session server actions with Next.js best practices
 * Handles practice sessions with proper validation and performance tracking
 */

'use server'

// Note: revalidateTag should only be used in server components/routes
import { handleServerActionError, validateRequest } from '@/lib/api/error-handler'
import {
  PracticeSessionCreateSchema,
  PracticeSessionQuerySchema,
  type PracticeSessionCreateRequest,
} from '@/lib/api/validation'
import {
  createPracticeSession,
  getUserPracticeSessions,
  getPracticeStats,
  updateVocabularyStats,
} from '@/lib/services/practiceService'
import { getCurrentUser } from '@/lib/actions/auth.actions'

// Types
interface PracticeActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    processingTime?: number
    sessionId?: string
  }
}

/**
 * Create new practice session
 */
export async function createPracticeSessionAction(
  sessionData: Omit<PracticeSessionCreateRequest, 'customer'>,
): Promise<PracticeActionResult> {
  try {
    const startTime = Date.now()

    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate input
    const validatedData = validateRequest(PracticeSessionCreateSchema, {
      ...sessionData,
      customer: user.id,
    })

    // Create practice session
    const session = await createPracticeSession(
      user.id,
      validatedData as PracticeSessionCreateRequest,
    )

    const processingTime = Date.now() - startTime

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
      data: session,
      meta: {
        processingTime,
        sessionId: session.id,
      },
    }
  } catch (error) {
    console.error('Create practice session error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get user practice sessions with filtering
 */
export async function getUserPracticeSessionsAction(
  options: {
    page?: number
    limit?: number
    sessionType?: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
    difficulty?: 'easy' | 'medium' | 'hard'
    dateFrom?: string
    dateTo?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {},
): Promise<PracticeActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate query parameters
    const validatedOptions = validateRequest(PracticeSessionQuerySchema, {
      customerId: user.id,
      ...options,
    })

    // Get practice sessions
    const result = await getUserPracticeSessions(user.id, validatedOptions as any)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Get practice sessions error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get practice statistics
 */
export async function getPracticeStatsAction(
  period: 'day' | 'week' | 'month' | 'year' = 'week',
): Promise<PracticeActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Get practice stats
    const stats = await getPracticeStats(user.id, period)

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('Get practice stats error:', error)
    handleServerActionError(error)
  }
}

/**
 * Update vocabulary statistics after practice
 */
export async function updateVocabularyStatsAction(
  vocabularyId: string,
  stats: {
    isCorrect: boolean
    timeSpent: number
    attempts: number
  },
): Promise<PracticeActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate input
    if (!vocabularyId || typeof vocabularyId !== 'string') {
      throw new Error('Vocabulary ID is required')
    }

    if (
      typeof stats.isCorrect !== 'boolean' ||
      typeof stats.timeSpent !== 'number' ||
      typeof stats.attempts !== 'number'
    ) {
      throw new Error('Invalid statistics data')
    }

    // Update vocabulary stats
    await updateVocabularyStats(vocabularyId, stats)

    // Note: Cache invalidation will be handled by the API route

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update vocabulary stats error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get practice session by ID
 */
export async function getPracticeSessionAction(sessionId: string): Promise<PracticeActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Session ID is required')
    }

    // Get practice session
    const sessions = await getUserPracticeSessions(user.id, {
      limit: 1,
      // Note: This is a simplified approach. In a real implementation,
      // you might want a dedicated getPracticeSessionById function
    })

    const session = sessions.docs?.find((s) => s.id === sessionId)

    if (!session) {
      throw new Error('Practice session not found')
    }

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Get practice session error:', error)
    handleServerActionError(error)
  }
}

/**
 * Get practice performance analytics
 */
export async function getPracticeAnalyticsAction(
  options: {
    period?: 'day' | 'week' | 'month' | 'year'
    sessionType?: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
    difficulty?: 'easy' | 'medium' | 'hard'
  } = {},
): Promise<PracticeActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    // Get practice sessions for analytics
    const sessions = await getUserPracticeSessions(user.id, {
      limit: 1000, // Get more data for analytics
      sessionType: options.sessionType,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    // Calculate analytics
    const analytics = calculatePracticeAnalytics(sessions.docs || [], options)

    return {
      success: true,
      data: analytics,
    }
  } catch (error) {
    console.error('Get practice analytics error:', error)
    handleServerActionError(error)
  }
}

/**
 * Helper function to calculate practice analytics
 */
function calculatePracticeAnalytics(
  sessions: any[],
  options: {
    period?: 'day' | 'week' | 'month' | 'year'
    difficulty?: 'easy' | 'medium' | 'hard'
  },
) {
  const now = new Date()
  const period = options.period || 'week'

  // Filter sessions by period
  const periodStart = new Date()
  switch (period) {
    case 'day':
      periodStart.setDate(now.getDate() - 1)
      break
    case 'week':
      periodStart.setDate(now.getDate() - 7)
      break
    case 'month':
      periodStart.setMonth(now.getMonth() - 1)
      break
    case 'year':
      periodStart.setFullYear(now.getFullYear() - 1)
      break
  }

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.createdAt)
    return (
      sessionDate >= periodStart &&
      (!options.difficulty || session.difficulty === options.difficulty)
    )
  })

  // Calculate metrics
  const totalSessions = filteredSessions.length
  const totalTimeSpent = filteredSessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0)
  const averageScore =
    totalSessions > 0
      ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
      : 0
  const bestScore = totalSessions > 0 ? Math.max(...filteredSessions.map((s) => s.score || 0)) : 0

  // Group by session type
  const sessionsByType = filteredSessions.reduce(
    (acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate daily progress
  const dailyProgress = calculateDailyProgress(filteredSessions, period)

  return {
    totalSessions,
    totalTimeSpent,
    averageScore,
    bestScore,
    sessionsByType,
    dailyProgress,
    period,
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
  }
}

/**
 * Helper function to calculate daily progress
 */
function calculateDailyProgress(sessions: any[], period: string) {
  const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365
  const progress = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.createdAt)
      return sessionDate >= dayStart && sessionDate <= dayEnd
    })

    progress.push({
      date: dayStart.toISOString().split('T')[0],
      sessions: daySessions.length,
      totalScore: daySessions.reduce((sum, s) => sum + (s.score || 0), 0),
      averageScore:
        daySessions.length > 0
          ? Math.round(daySessions.reduce((sum, s) => sum + (s.score || 0), 0) / daySessions.length)
          : 0,
      timeSpent: daySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
    })
  }

  return progress
}
