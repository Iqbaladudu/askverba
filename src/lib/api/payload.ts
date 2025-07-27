/**
 * PayloadCMS Local API Service Layer
 * Converts all CRUD operations from URL-based API to Local API
 * Uses Local API with proper authentication and error handling
 * Note: These functions are used by API routes, not as server actions
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import {
  UserProgress,
  Vocabulary,
  TranslationHistory,
  LearningGoal,
  UserPreference,
  Achievement,
  UserAchievement,
  PracticeSession,
} from '@/payload-types'

// Types for API responses
interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Helper function to get payload instance
async function getPayloadInstance() {
  return await getPayload({ config })
}

// User Progress API
export const userProgressAPI = {
  async get(customerId: string): Promise<PayloadResponse<UserProgress>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.find({
        collection: 'user-progress',
        where: {
          customer: {
            equals: customerId,
          },
        },
        limit: 1,
        user,
      })

      return result as PayloadResponse<UserProgress>
    } catch (error) {
      console.error('Error getting user progress:', error)
      throw new Error('Failed to get user progress')
    }
  },

  async create(data: any): Promise<UserProgress> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'user-progress',
        data,
        user,
      })

      return result as UserProgress
    } catch (error) {
      console.error('Error creating user progress:', error)
      throw new Error('Failed to create user progress')
    }
  },

  async update(id: string, data: any): Promise<UserProgress> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.update({
        collection: 'user-progress',
        id,
        data,
        user,
      })

      return result as UserProgress
    } catch (error) {
      console.error('Error updating user progress:', error)
      throw new Error('Failed to update user progress')
    }
  },

  async upsert(customerId: string, data: any): Promise<UserProgress> {
    try {
      const existing = await this.get(customerId)
      if (existing.docs.length > 0) {
        return this.update(existing.docs[0].id, data)
      } else {
        return this.create({ ...data, customer: customerId })
      }
    } catch (error) {
      return this.create({ ...data, customer: customerId })
    }
  },
}

// Vocabulary API
export const vocabularyAPI = {
  async getByCustomer(customerId: string, options: any = {}): Promise<PayloadResponse<Vocabulary>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()
      const { limit = 50, page = 1, status, difficulty, search } = options

      // Build where clause
      const where: any = {
        customer: {
          equals: customerId,
        },
      }

      if (status) {
        where.status = { equals: status }
      }

      if (difficulty) {
        where.difficulty = { equals: difficulty }
      }

      if (search) {
        where.word = { contains: search }
      }

      const result = await payload.find({
        collection: 'vocabulary',
        where,
        limit,
        page,
        user,
      })

      return result as PayloadResponse<Vocabulary>
    } catch (error) {
      console.error('Error getting vocabulary:', error)
      throw new Error('Failed to get vocabulary')
    }
  },

  async create(data: any): Promise<Vocabulary> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'vocabulary',
        data,
        user,
      })

      return result as Vocabulary
    } catch (error) {
      console.error('Error creating vocabulary:', error)
      throw new Error('Failed to create vocabulary')
    }
  },

  async update(id: string, data: any): Promise<Vocabulary> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.update({
        collection: 'vocabulary',
        id,
        data,
        user,
      })

      return result as Vocabulary
    } catch (error) {
      console.error('Error updating vocabulary:', error)
      throw new Error('Failed to update vocabulary')
    }
  },

  async delete(id: string): Promise<Vocabulary> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.delete({
        collection: 'vocabulary',
        id,
        user,
      })

      return result as Vocabulary
    } catch (error) {
      console.error('Error deleting vocabulary:', error)
      throw new Error('Failed to delete vocabulary')
    }
  },

  async getStats(customerId: string) {
    try {
      const all = await this.getByCustomer(customerId, { limit: 1000 })
      const docs = all.docs || []

      return {
        totalWords: docs.length,
        masteredWords: docs.filter((w: Vocabulary) => w.status === 'mastered').length,
        learningWords: docs.filter((w: Vocabulary) => w.status === 'learning').length,
        newWords: docs.filter((w: Vocabulary) => w.status === 'new').length,
      }
    } catch (error) {
      console.error('Error getting vocabulary stats:', error)
      throw new Error('Failed to get vocabulary stats')
    }
  },
}

// Translation History API
export const translationHistoryAPI = {
  async getByCustomer(
    customerId: string,
    options: any = {},
  ): Promise<PayloadResponse<TranslationHistory>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()
      const {
        limit = 50,
        page = 1,
        mode,
        isFavorite,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        dateFrom,
        dateTo,
        sourceLanguage,
        targetLanguage,
        minCharacters,
        maxCharacters,
      } = options

      // Build where clause
      const where: any = {
        customer: {
          equals: customerId,
        },
      }

      if (mode) {
        where.mode = { equals: mode }
      }

      if (isFavorite !== undefined) {
        where.isFavorite = { equals: isFavorite }
      }

      if (search) {
        where.or = [
          { originalText: { contains: search } },
          { translatedText: { contains: search } },
        ]
      }

      // Date range filtering
      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) {
          where.createdAt.greater_than_equal = dateFrom
        }
        if (dateTo) {
          where.createdAt.less_than_equal = dateTo
        }
      }

      // Language filtering
      if (sourceLanguage) {
        where.sourceLanguage = { equals: sourceLanguage }
      }

      if (targetLanguage) {
        where.targetLanguage = { equals: targetLanguage }
      }

      // Character count filtering
      if (minCharacters || maxCharacters) {
        where.characterCount = {}
        if (minCharacters) {
          where.characterCount.greater_than_equal = minCharacters
        }
        if (maxCharacters) {
          where.characterCount.less_than_equal = maxCharacters
        }
      }

      // Build sort string
      const sortString = `${sortOrder === 'asc' ? '' : '-'}${sortBy}`

      const result = await payload.find({
        collection: 'translation-history',
        where,
        limit,
        page,
        sort: sortString,
        user,
      })

      return result as PayloadResponse<TranslationHistory>
    } catch (error) {
      console.error('Error getting translation history:', error)
      throw new Error('Failed to get translation history')
    }
  },

  async create(data: any): Promise<TranslationHistory> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'translation-history',
        data,
        user,
      })

      return result as TranslationHistory
    } catch (error) {
      console.error('Error creating translation history:', error)
      throw new Error('Failed to create translation history')
    }
  },

  async update(id: string, data: any): Promise<TranslationHistory> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.update({
        collection: 'translation-history',
        id,
        data,
        user,
      })

      return result as TranslationHistory
    } catch (error) {
      console.error('Error updating translation history:', error)
      throw new Error('Failed to update translation history')
    }
  },

  async delete(id: string): Promise<TranslationHistory> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.delete({
        collection: 'translation-history',
        id,
        user,
      })

      return result as TranslationHistory
    } catch (error) {
      console.error('Error deleting translation history:', error)
      throw new Error('Failed to delete translation history')
    }
  },

  async getStats(customerId: string) {
    try {
      const all = await this.getByCustomer(customerId, { limit: 1000 })
      const docs = all.docs || []

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)

      // Generate recent activity for the last 7 days
      const recentActivity = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const count = docs.filter((t: TranslationHistory) => {
          const createdAt = new Date(t.createdAt)
          return createdAt >= dayStart && createdAt <= dayEnd
        }).length

        recentActivity.push({
          date: date.toISOString().split('T')[0],
          count,
        })
      }

      // Find longest translation
      const longestTranslation =
        docs.length > 0
          ? Math.max(...docs.map((t: TranslationHistory) => t.characterCount || 0))
          : 0

      return {
        totalTranslations: docs.length,
        todayTranslations: docs.filter((t: TranslationHistory) => new Date(t.createdAt) >= today)
          .length,
        thisWeekTranslations: docs.filter(
          (t: TranslationHistory) => new Date(t.createdAt) >= thisWeek,
        ).length,
        favoriteTranslations: docs.filter((t: TranslationHistory) => t.isFavorite).length,
        averageCharacterCount:
          docs.length > 0
            ? Math.round(
                docs.reduce(
                  (sum: number, t: TranslationHistory) => sum + (t.characterCount || 0),
                  0,
                ) / docs.length,
              )
            : 0,
        longestTranslation,
        recentActivity,
      }
    } catch (error) {
      console.error('Error getting translation history stats:', error)
      throw new Error('Failed to get translation history stats')
    }
  },
}

// Learning Goals API
export const learningGoalsAPI = {
  async getByCustomer(
    customerId: string,
    options: any = {},
  ): Promise<PayloadResponse<LearningGoal>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()
      const { status = 'active', category } = options

      // Build where clause
      const where: any = {
        customer: {
          equals: customerId,
        },
        status: {
          equals: status,
        },
      }

      if (category) {
        where.category = { equals: category }
      }

      const result = await payload.find({
        collection: 'learning-goals',
        where,
        sort: '-createdAt',
        user,
      })

      return result as PayloadResponse<LearningGoal>
    } catch (error) {
      console.error('Error getting learning goals:', error)
      throw new Error('Failed to get learning goals')
    }
  },

  async create(data: any): Promise<LearningGoal> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'learning-goals',
        data,
        user,
      })

      return result as LearningGoal
    } catch (error) {
      console.error('Error creating learning goal:', error)
      throw new Error('Failed to create learning goal')
    }
  },

  async update(id: string, data: any): Promise<LearningGoal> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.update({
        collection: 'learning-goals',
        id,
        data,
        user,
      })

      return result as LearningGoal
    } catch (error) {
      console.error('Error updating learning goal:', error)
      throw new Error('Failed to update learning goal')
    }
  },

  async updateProgress(id: string, current: number): Promise<LearningGoal> {
    return this.update(id, { current })
  },
}

// User Preferences API
export const userPreferencesAPI = {
  async get(customerId: string): Promise<PayloadResponse<UserPreference>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.find({
        collection: 'user-preferences',
        where: {
          customer: {
            equals: customerId,
          },
        },
        limit: 1,
        user,
      })

      return result as PayloadResponse<UserPreference>
    } catch (error) {
      console.error('Error getting user preferences:', error)
      throw new Error('Failed to get user preferences')
    }
  },

  async create(data: any): Promise<UserPreference> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'user-preferences',
        data,
        user,
      })

      return result as UserPreference
    } catch (error) {
      console.error('Error creating user preferences:', error)
      throw new Error('Failed to create user preferences')
    }
  },

  async update(id: string, data: any): Promise<UserPreference> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.update({
        collection: 'user-preferences',
        id,
        data,
        user,
      })

      return result as UserPreference
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw new Error('Failed to update user preferences')
    }
  },

  async upsert(customerId: string, data: any): Promise<UserPreference> {
    try {
      const existing = await this.get(customerId)
      if (existing.docs.length > 0) {
        return this.update(existing.docs[0].id, data)
      } else {
        return this.create({ ...data, customer: customerId })
      }
    } catch (error) {
      return this.create({ ...data, customer: customerId })
    }
  },
}

// Achievements API
export const achievementsAPI = {
  async getAll(): Promise<PayloadResponse<Achievement>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.find({
        collection: 'achievements',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'order',
        user,
      })

      return result as PayloadResponse<Achievement>
    } catch (error) {
      console.error('Error getting achievements:', error)
      throw new Error('Failed to get achievements')
    }
  },

  async getUserAchievements(customerId: string): Promise<PayloadResponse<UserAchievement>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.find({
        collection: 'user-achievements',
        where: {
          customer: {
            equals: customerId,
          },
        },

        user,
      })

      return result as PayloadResponse<UserAchievement>
    } catch (error) {
      console.error('Error getting user achievements:', error)
      throw new Error('Failed to get user achievements')
    }
  },

  async unlockAchievement(
    customerId: string,
    achievementId: string,
    progress = 100,
  ): Promise<UserAchievement> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.create({
        collection: 'user-achievements',
        data: {
          customer: customerId,
          achievement: achievementId,
          progress,
          unlockedAt: new Date().toISOString(),
        },
        user,
      })

      return result as UserAchievement
    } catch (error) {
      console.error('Error unlocking achievement:', error)
      throw new Error('Failed to unlock achievement')
    }
  },
}

// Practice Sessions API
export const practiceAPI = {
  async getByCustomer(
    customerId: string,
    options: any = {},
  ): Promise<PayloadResponse<PracticeSession>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()
      const { limit = 50, page = 1, sessionType } = options

      // Build where clause
      const where: any = {
        customer: {
          equals: customerId,
        },
      }

      if (sessionType) {
        where.sessionType = { equals: sessionType }
      }

      const result = await payload.find({
        collection: 'practice-sessions',
        where,
        limit,
        page,
        sort: '-createdAt',
        user,
      })

      return result as PayloadResponse<PracticeSession>
    } catch (error) {
      console.error('Error getting practice sessions:', error)
      // Return empty result instead of throwing error for new users
      return {
        docs: [],
        totalDocs: 0,
        limit: limit || 10,
        totalPages: 0,
        page: page || 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      } as PayloadResponse<PracticeSession>
    }
  },

  async create(data: any): Promise<PracticeSession> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      console.log('CREATE', data)
      const result = await payload.create({
        collection: 'practice-sessions',
        data,
        user,
      })

      return result as PracticeSession
    } catch (error) {
      console.error('Error creating practice session:', error)
      throw new Error('Failed to create practice session')
    }
  },

  async update(id: string, data: any): Promise<PracticeSession> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      console.log('UPDATE', data)
      const result = await payload.update({
        collection: 'practice-sessions',
        id,
        data,
        user,
      })

      return result as PracticeSession
    } catch (error) {
      console.error('Error updating practice session:', error)
      throw new Error('Failed to update practice session')
    }
  },

  async delete(id: string): Promise<PracticeSession> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()

      const result = await payload.delete({
        collection: 'practice-sessions',
        id,
        user,
      })

      return result as PracticeSession
    } catch (error) {
      console.error('Error deleting practice session:', error)
      throw new Error('Failed to delete practice session')
    }
  },

  async getStats(customerId: string) {
    try {
      const sessions = await this.getByCustomer(customerId, { limit: 1000 })

      if (!sessions.docs || sessions.docs.length === 0) {
        return {
          totalSessions: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          currentStreak: 0,
          sessionTypes: {},
          recentSessions: [],
        }
      }

      const totalSessions = sessions.docs.length
      const totalTimeSpent = sessions.docs.reduce(
        (sum: number, session: PracticeSession) => sum + (session.timeSpent || 0),
        0,
      )
      const totalScore = sessions.docs.reduce(
        (sum: number, session: PracticeSession) => sum + (session.score || 0),
        0,
      )
      const averageScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0

      // Calculate streak (consecutive days with practice)
      const sessionDates = sessions.docs
        .map((session: PracticeSession) => new Date(session.createdAt).toDateString())
        .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index)
        .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())

      let currentStreak = 0
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

      if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
        const startDate = sessionDates.includes(today) ? today : yesterday
        const checkDate = new Date(startDate)

        for (const dateStr of sessionDates) {
          if (dateStr === checkDate.toDateString()) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
      }

      // Session types breakdown
      const sessionTypes = sessions.docs.reduce((acc: any, session: PracticeSession) => {
        const type = session.sessionType || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      return {
        totalSessions,
        totalTimeSpent,
        averageScore,
        currentStreak,
        sessionTypes,
        recentSessions: sessions.docs.slice(0, 5),
      }
    } catch (error) {
      console.error('Error getting practice stats:', error)
      // Return default stats for new users
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        currentStreak: 0,
        sessionTypes: {},
        recentSessions: [],
      }
    }
  },

  async getWordsForPractice(
    customerId: string,
    options: any = {},
  ): Promise<PayloadResponse<Vocabulary>> {
    try {
      const user = await getAuthenticatedUser()
      const payload = await getPayloadInstance()
      const { limit = 20, difficulty, status } = options

      // Build where clause
      const where: any = {
        customer: {
          equals: customerId,
        },
      }

      // Only add optional parameters if they have valid values
      if (difficulty && difficulty !== 'all' && difficulty !== null && difficulty !== undefined) {
        where.difficulty = { equals: difficulty }
      }

      if (status && status !== 'all' && status !== null && status !== undefined) {
        where.status = { equals: status }
      }

      const result = await payload.find({
        collection: 'vocabulary',
        where,
        limit,
        sort: 'lastPracticed',
        user,
      })

      return result as PayloadResponse<Vocabulary>
    } catch (error) {
      console.error('Error getting words for practice:', error)
      throw new Error('Failed to get words for practice')
    }
  },
}

// Helper function to get current customer ID
export async function getCurrentCustomerId(): Promise<string | null> {
  try {
    const user = await getCurrentUser()
    return user?.id || null
  } catch (error) {
    console.error('Error getting current customer:', error)
    return null
  }
}
