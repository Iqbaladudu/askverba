'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { TranslationCache } from '@/lib/redis'
import { PracticeSessions, Vocabulary } from '@/payload-types'

export interface PracticeSessionData {
  sessionType: 'flashcard' | 'multiple_choice' | 'typing' | 'listening'
  words: Array<{
    vocabularyId: string
    isCorrect: boolean
    timeSpent: number
    attempts: number
  }>
  score: number
  timeSpent: number
  difficulty: 'easy' | 'medium' | 'hard'
  metadata?: {
    totalQuestions: number
    correctAnswers: number
    averageTimePerQuestion: number
    streakCount: number
  }
}

export interface PracticeStats {
  totalSessions: number
  totalTimeSpent: number
  averageScore: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  sessionsByType: {
    flashcard: number
    multiple_choice: number
    typing: number
    listening: number
  }
  recentSessions: PracticeSessions[]
}

/**
 * Create a new practice session
 */
export async function createPracticeSession(
  userId: string,
  sessionData: PracticeSessionData,
): Promise<PracticeSessions> {
  try {
    const payload = await getPayload({ config })

    // Create the practice session
    const session = await payload.create({
      collection: 'practice-sessions',
      data: {
        ...sessionData,
        customer: userId,
      },
    })

    // Update vocabulary statistics for each word practiced
    for (const wordResult of sessionData.words) {
      await updateVocabularyStats(wordResult.vocabularyId, {
        isCorrect: wordResult.isCorrect,
        timeSpent: wordResult.timeSpent,
        attempts: wordResult.attempts,
      })
    }

    // Clear user cache to refresh data
    await TranslationCache.clearUserCache(userId)

    return session
  } catch (error) {
    console.error('Failed to create practice session:', error)
    throw new Error('Failed to create practice session')
  }
}

/**
 * Update vocabulary statistics after practice
 */
async function updateVocabularyStats(
  vocabularyId: string,
  practiceResult: {
    isCorrect: boolean
    timeSpent: number
    attempts: number
  },
): Promise<void> {
  try {
    const payload = await getPayload({ config })

    // Get current vocabulary entry
    const vocabulary = await payload.findByID({
      collection: 'vocabulary',
      id: vocabularyId,
    })

    if (!vocabulary) return

    // Calculate new statistics
    const currentPracticeCount = vocabulary.practiceCount || 0
    const currentAccuracy = vocabulary.accuracy || 0
    const newPracticeCount = currentPracticeCount + 1

    // Calculate new accuracy using weighted average
    const newAccuracy = Math.round(
      (currentAccuracy * currentPracticeCount + (practiceResult.isCorrect ? 100 : 0)) /
        newPracticeCount,
    )

    // Determine new status based on performance
    let newStatus = vocabulary.status
    if (newAccuracy >= 80 && newPracticeCount >= 5) {
      newStatus = 'mastered'
    } else if (newPracticeCount >= 2) {
      newStatus = 'learning'
    }

    // Update vocabulary entry
    await payload.update({
      collection: 'vocabulary',
      id: vocabularyId,
      data: {
        practiceCount: newPracticeCount,
        accuracy: newAccuracy,
        status: newStatus,
        lastPracticed: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update vocabulary stats:', error)
    // Don't throw error to avoid breaking the practice session creation
  }
}

/**
 * Get practice statistics with caching
 */
export async function getPracticeStats(userId: string): Promise<PracticeStats> {
  try {
    // Check cache first using the correct method
    const redis = (await import('@/lib/redis')).default
    const cacheKey = `user:${userId}:practice:stats`

    let cached: string | null = null
    if (redis) {
      try {
        cached = await redis.get(cacheKey)
      } catch (error) {
        console.warn('Redis cache read failed:', error)
      }
    }

    if (cached) {
      return JSON.parse(cached)
    }

    const payload = await getPayload({ config })

    // Get all practice sessions for the user
    const sessionsResponse = await payload.find({
      collection: 'practice-sessions',
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: 1000,
      sort: '-createdAt',
    })

    const sessions = sessionsResponse.docs || []

    // Calculate statistics
    const stats: PracticeStats = {
      totalSessions: sessions.length,
      totalTimeSpent: sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
      averageScore:
        sessions.length > 0
          ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
          : 0,
      bestScore: sessions.length > 0 ? Math.max(...sessions.map((s) => s.score || 0)) : 0,
      currentStreak: calculateCurrentStreak(sessions),
      longestStreak: calculateLongestStreak(sessions),
      sessionsByType: {
        flashcard: sessions.filter((s) => s.sessionType === 'flashcard').length,
        multiple_choice: sessions.filter((s) => s.sessionType === 'multiple_choice').length,
        typing: sessions.filter((s) => s.sessionType === 'typing').length,
        listening: sessions.filter((s) => s.sessionType === 'listening').length,
      },
      recentSessions: sessions.slice(0, 10),
    }

    // Cache the stats for 1 hour
    if (redis) {
      try {
        await redis.setex(cacheKey, 3600, JSON.stringify(stats))
      } catch (error) {
        console.warn('Redis cache write failed:', error)
      }
    }

    return stats
  } catch (error) {
    console.error('Failed to get practice stats:', error)
    throw new Error('Failed to fetch practice statistics')
  }
}

/**
 * Calculate current streak (consecutive days with practice)
 */
function calculateCurrentStreak(sessions: PracticeSessions[]): number {
  if (sessions.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const currentDate = new Date(today)

  // Group sessions by date
  const sessionsByDate = new Map<string, PracticeSessions[]>()
  sessions.forEach((session) => {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)
    const dateKey = sessionDate.toISOString().split('T')[0]

    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, [])
    }
    sessionsByDate.get(dateKey)!.push(session)
  })

  // Count consecutive days with practice
  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0]
    if (sessionsByDate.has(dateKey)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate longest streak
 */
function calculateLongestStreak(sessions: PracticeSessions[]): number {
  if (sessions.length === 0) return 0

  // Group sessions by date
  const sessionDates = new Set<string>()
  sessions.forEach((session) => {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)
    sessionDates.add(sessionDate.toISOString().split('T')[0])
  })

  const sortedDates = Array.from(sessionDates).sort()

  let longestStreak = 0
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currentDate = new Date(sortedDates[i])

    // Check if dates are consecutive
    const diffTime = currentDate.getTime() - prevDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(longestStreak, currentStreak)
}

/**
 * Get user's practice sessions with pagination
 */
export async function getUserPracticeSessions(
  userId: string,
  options: {
    limit?: number
    page?: number
    sessionType?: 'flashcard' | 'multiple_choice' | 'typing' | 'listening'
  } = {},
): Promise<{
  docs: PracticeSessions[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  try {
    const { limit = 20, page = 1, sessionType } = options

    const payload = await getPayload({ config })

    const where: any = {
      customer: {
        equals: userId,
      },
    }

    if (sessionType) {
      where.sessionType = { equals: sessionType }
    }

    const response = await payload.find({
      collection: 'practice-sessions',
      where,
      limit,
      page,
      sort: '-createdAt',
    })

    return {
      docs: response.docs,
      totalDocs: response.totalDocs,
      limit: response.limit,
      page: response.page || 1,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPrevPage: response.hasPrevPage,
    }
  } catch (error) {
    console.error('Failed to get practice sessions:', error)
    throw new Error('Failed to fetch practice sessions')
  }
}

/**
 * Delete a practice session
 */
export async function deletePracticeSession(userId: string, sessionId: string): Promise<void> {
  try {
    const payload = await getPayload({ config })

    await payload.delete({
      collection: 'practice-sessions',
      id: sessionId,
    })

    // Clear user cache to refresh data
    await TranslationCache.clearUserCache(userId)
  } catch (error) {
    console.error('Failed to delete practice session:', error)
    throw new Error('Failed to delete practice session')
  }
}
