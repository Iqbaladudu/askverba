'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  userProgressAPI,
  translationHistoryAPI,
  learningGoalsAPI,
  userPreferencesAPI,
  achievementsAPI,
} from '@/lib/api/payload'

// User Progress Hook
export function useUserProgress() {
  const { customer } = useAuth()
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!customer?.id) return

    try {
      setLoading(true)
      const response = await userProgressAPI.get(customer.id)
      setProgress(response.docs[0] || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
    } finally {
      setLoading(false)
    }
  }, [customer?.id])

  const updateProgress = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const response = await userProgressAPI.upsert(customer.id, data)
        setProgress(response.doc || response)
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress')
        throw err
      }
    },
    [customer?.id],
  )

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return { progress, loading, error, updateProgress, refetch: fetchProgress }
}

// Vocabulary Hook
export function useVocabulary(options: any = {}) {
  const { customer } = useAuth()
  const [vocabulary, setVocabulary] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const fetchVocabulary = useCallback(async () => {
    if (!customer?.id) {
      console.log('useVocabulary: No customer ID available')
      return
    }

    try {
      setLoading(true)
      console.log(
        'useVocabulary: Fetching vocabulary for customer:',
        customer.id,
        'with options:',
        options,
      )

      // Use the new vocabulary service with caching
      const { getUserVocabulary, getVocabularyStats } = await import(
        '@/lib/services/vocabularyService'
      )

      const [vocabResponse, statsData] = await Promise.all([
        getUserVocabulary(customer.id, options),
        getVocabularyStats(customer.id),
      ])

      console.log('useVocabulary: Received vocabulary response:', {
        docsCount: vocabResponse.docs?.length || 0,
        totalDocs: vocabResponse.totalDocs,
        fromCache: vocabResponse.fromCache,
        docs: vocabResponse.docs,
      })

      setVocabulary(vocabResponse.docs || [])
      setStats(statsData)
      setPagination({
        totalDocs: vocabResponse.totalDocs,
        limit: vocabResponse.limit,
        page: vocabResponse.page,
        totalPages: vocabResponse.totalPages,
        hasNextPage: vocabResponse.hasNextPage,
        hasPrevPage: vocabResponse.hasPrevPage,
        fromCache: vocabResponse.fromCache,
      })
      setError(null)
    } catch (err) {
      console.error('Vocabulary fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary')
    } finally {
      setLoading(false)
    }
  }, [customer?.id, JSON.stringify(options)])

  const addWord = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const { createVocabularyEntry } = await import('@/lib/services/vocabularyService')
        const response = await createVocabularyEntry(customer.id, data)
        await fetchVocabulary() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add word')
        throw err
      }
    },
    [customer?.id, fetchVocabulary],
  )

  const updateWord = useCallback(
    async (id: string, data: any) => {
      if (!customer?.id) return

      try {
        const { updateVocabularyEntry } = await import('@/lib/services/vocabularyService')
        const response = await updateVocabularyEntry(customer.id, id, data)
        await fetchVocabulary() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update word')
        throw err
      }
    },
    [customer?.id, fetchVocabulary],
  )

  const deleteWord = useCallback(
    async (id: string) => {
      if (!customer?.id) return

      try {
        const { deleteVocabularyEntry } = await import('@/lib/services/vocabularyService')
        await deleteVocabularyEntry(customer.id, id)
        await fetchVocabulary() // Refresh data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete word')
        throw err
      }
    },
    [customer?.id, fetchVocabulary],
  )

  useEffect(() => {
    fetchVocabulary()
  }, [fetchVocabulary])

  return {
    vocabulary,
    words: vocabulary, // Alias for backward compatibility
    stats,
    pagination,
    loading,
    error,
    addWord,
    createWord: addWord, // Alias for consistency
    updateWord,
    deleteWord,
    refetch: fetchVocabulary,
  }
}

// Translation History Hook
export function useTranslationHistory(options: any = {}) {
  const { customer } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const optionsString = useMemo(() => JSON.stringify(options), [options])

  const fetchHistory = useCallback(async () => {
    if (!customer?.id) {
      console.log('useTranslationHistory: No customer ID')
      return
    }

    try {
      setLoading(true)
      console.log(
        'useTranslationHistory: Fetching data for customer:',
        customer.id,
        'options:',
        options,
      )

      const [historyResponse, statsData] = await Promise.all([
        translationHistoryAPI.getByCustomer(customer.id, options),
        translationHistoryAPI.getStats(customer.id),
      ])

      console.log('useTranslationHistory: API Response:', {
        historyResponse,
        historyDocs: historyResponse.docs,
        docsLength: historyResponse.docs?.length,
        statsData,
      })

      setHistory(historyResponse.docs || [])
      setStats(statsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }, [customer?.id, optionsString])

  const addTranslation = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const response = await translationHistoryAPI.create({
          ...data,
          customer: customer.id,
        })
        await fetchHistory() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save translation')
        throw err
      }
    },
    [customer?.id, fetchHistory],
  )

  const updateTranslation = useCallback(
    async (id: string, data: any) => {
      try {
        const response = await translationHistoryAPI.update(id, data)
        await fetchHistory() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update translation')
        throw err
      }
    },
    [fetchHistory],
  )

  const toggleFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      return updateTranslation(id, { isFavorite })
    },
    [updateTranslation],
  )

  const deleteTranslation = useCallback(
    async (id: string) => {
      try {
        await translationHistoryAPI.delete(id)
        await fetchHistory() // Refresh data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete translation')
        throw err
      }
    },
    [fetchHistory],
  )

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    stats,
    loading,
    error,
    addTranslation,
    updateTranslation,
    toggleFavorite,
    deleteTranslation,
    refetch: fetchHistory,
  }
}

// Learning Goals Hook
export function useLearningGoals(options: any = {}) {
  const { customer } = useAuth()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    if (!customer?.id) return

    try {
      setLoading(true)

      // Build query parameters
      const queryParams = new URLSearchParams()
      if (options.status) queryParams.append('status', options.status)
      if (options.category) queryParams.append('category', options.category)
      if (options.limit) queryParams.append('limit', options.limit.toString())
      if (options.page) queryParams.append('page', options.page.toString())

      const queryString = queryParams.toString()
      const url = queryString ? `/api/learning-goals?${queryString}` : '/api/learning-goals'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }

      const result = await response.json()
      setGoals(result.data?.docs || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals')
    } finally {
      setLoading(false)
    }
  }, [customer?.id, JSON.stringify(options)])

  const createGoal = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const response = await fetch('/api/learning-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create goal')
        }

        const result = await response.json()
        await fetchGoals() // Refresh data
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create goal')
        throw err
      }
    },
    [customer?.id, fetchGoals],
  )

  const updateGoalProgress = useCallback(
    async (id: string, current: number) => {
      if (!customer?.id) return

      try {
        const response = await fetch('/api/learning-goals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, current }),
        })

        if (!response.ok) {
          throw new Error('Failed to update goal progress')
        }

        const result = await response.json()
        await fetchGoals() // Refresh data
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update goal progress')
        throw err
      }
    },
    [customer?.id, fetchGoals],
  )

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!customer?.id) return

      try {
        const response = await fetch(`/api/learning-goals?id=${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete goal')
        }

        await fetchGoals() // Refresh data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete goal')
        throw err
      }
    },
    [customer?.id, fetchGoals],
  )

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    refetch: fetchGoals,
  }
}

// User Preferences Hook
export function useUserPreferences() {
  const { customer } = useAuth()
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!customer?.id) return

    try {
      setLoading(true)
      const response = await userPreferencesAPI.get(customer.id)
      setPreferences(response.docs[0] || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences')
    } finally {
      setLoading(false)
    }
  }, [customer?.id])

  const updatePreferences = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const response = await userPreferencesAPI.upsert(customer.id, data)
        setPreferences(response.doc || response)
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preferences')
        throw err
      }
    },
    [customer?.id],
  )

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return { preferences, loading, error, updatePreferences, refetch: fetchPreferences }
}

// Achievements Hook
export function useAchievements() {
  const { customer } = useAuth()
  const [achievements, setAchievements] = useState<any[]>([])
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    if (!customer?.id) return

    try {
      setLoading(true)
      const [allAchievements, userAchievementsResponse] = await Promise.all([
        achievementsAPI.getAll(),
        achievementsAPI.getUserAchievements(customer.id),
      ])

      setAchievements(allAchievements.docs || [])
      setUserAchievements(userAchievementsResponse.docs || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }, [customer?.id])

  const unlockAchievement = useCallback(
    async (achievementId: string, progress = 100) => {
      if (!customer?.id) return

      try {
        const response = await achievementsAPI.unlockAchievement(
          customer.id,
          achievementId,
          progress,
        )
        await fetchAchievements() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unlock achievement')
        throw err
      }
    },
    [customer?.id, fetchAchievements],
  )

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return {
    achievements,
    userAchievements,
    loading,
    error,
    unlockAchievement,
    refetch: fetchAchievements,
  }
}

// Practice Hook
export function usePractice() {
  const { customer } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!customer?.id) return

    try {
      setLoading(true)
      const { getUserPracticeSessions } = await import('@/lib/services/practiceService')
      const response = await getUserPracticeSessions(customer.id, {})
      setSessions(response.docs || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch practice sessions')
    } finally {
      setLoading(false)
    }
  }, [customer?.id])

  const fetchStats = useCallback(async () => {
    if (!customer?.id) return

    try {
      const { getPracticeStats } = await import('@/lib/services/practiceService')
      const response = await getPracticeStats(customer.id)
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch practice stats')
    }
  }, [customer?.id])

  const createSession = useCallback(
    async (sessionData: any) => {
      if (!customer?.id) return

      try {
        const { createPracticeSession } = await import('@/lib/services/practiceService')
        const response = await createPracticeSession(customer.id, sessionData)
        await fetchSessions()
        await fetchStats()
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create practice session')
        throw err
      }
    },
    [customer?.id, fetchSessions, fetchStats],
  )

  const getWordsForPractice = useCallback(
    async (options: any = {}) => {
      if (!customer?.id) return []

      try {
        const { getWordsForPractice } = await import('@/lib/services/vocabularyService')
        const words = await getWordsForPractice(customer.id, options)
        return words || []
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get practice words')
        return []
      }
    },
    [customer?.id],
  )

  useEffect(() => {
    if (customer?.id) {
      fetchSessions()
      fetchStats()
    }
  }, [customer?.id, fetchSessions, fetchStats])

  return {
    sessions,
    stats,
    loading,
    error,
    createSession,
    getWordsForPractice,
    refetch: fetchSessions,
  }
}
