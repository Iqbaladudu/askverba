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
export function useVocabulary() {
  const { customer } = useAuth()
  const [vocabulary, setVocabulary] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  // Create a simple refetch function for CRUD operations
  const refetchVocabulary = useCallback(async () => {
    if (!customer?.id) return

    console.log('🔄 Manual refetch triggered')

    try {
      setLoading(true)
      setError(null)

      // Fetch fresh data immediately
      const { getUserVocabulary, getVocabularyStats } = await import(
        '@/lib/services/vocabularyService'
      )

      const [vocabResponse, statsData] = await Promise.all([
        getUserVocabulary(customer.id),
        getVocabularyStats(customer.id),
      ])

      console.log('🔄 Refetch results:', {
        vocabDocsLength: vocabResponse?.docs?.length || 0,
        vocabResponse,
        statsData,
      })

      // Update state with fresh data
      setVocabulary(vocabResponse?.docs || [])
      setStats(statsData || null)
      setPagination({
        totalDocs: vocabResponse?.totalDocs || 0,
        limit: vocabResponse?.limit || 20,
        page: vocabResponse?.page || 1,
        totalPages: vocabResponse?.totalPages || 0,
        hasNextPage: vocabResponse?.hasNextPage || false,
        hasPrevPage: vocabResponse?.hasPrevPage || false,
        fromCache: false, // No cache implementation
      })
      setError(null)
    } catch (err) {
      console.error('❌ Refetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to refetch vocabulary')
    } finally {
      setLoading(false)
    }
  }, [customer?.id])

  const addWord = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const { createVocabularyEntry } = await import('@/lib/services/vocabularyService')
        const response = await createVocabularyEntry(customer.id, data)
        refetchVocabulary() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add word')
        throw err
      }
    },
    [customer?.id, refetchVocabulary],
  )

  const updateWord = useCallback(
    async (id: string, data: any) => {
      if (!customer?.id) return
      try {
        const { updateVocabularyEntry } = await import('@/lib/services/vocabularyService')
        const response = await updateVocabularyEntry(customer.id, id, data)
        refetchVocabulary() // Refresh data
        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update word')
        throw err
      }
    },
    [customer?.id, refetchVocabulary],
  )

  const deleteWord = useCallback(
    async (id: string) => {
      if (!customer?.id) return

      try {
        const { deleteVocabularyEntry } = await import('@/lib/services/vocabularyService')
        await deleteVocabularyEntry(customer.id, id)
        refetchVocabulary() // Refresh data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete word')
        throw err
      }
    },
    [customer?.id, refetchVocabulary],
  )

  // Simplified effect that focuses on the core issue
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!customer?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Import services
        const { getUserVocabulary, getVocabularyStats } = await import(
          '@/lib/services/vocabularyService'
        )

        // Fetch data
        const [vocabResponse, statsData] = await Promise.all([
          getUserVocabulary(customer.id),
          getVocabularyStats(customer.id),
        ])

        // Only update state if component is still mounted
        if (isMounted) {
          console.log('✅ Setting vocabulary state:', vocabResponse?.docs?.length || 0, 'items')

          setVocabulary(vocabResponse?.docs || [])
          setStats(statsData || null)
          setPagination({
            totalDocs: vocabResponse?.totalDocs || 0,
            limit: vocabResponse?.limit || 20,
            page: vocabResponse?.page || 1,
            totalPages: vocabResponse?.totalPages || 0,
            hasNextPage: vocabResponse?.hasNextPage || false,
            hasPrevPage: vocabResponse?.hasPrevPage || false,
            fromCache: false, // No cache implementation
          })

          // Log final state
          console.log('📊 Final vocabulary state set:', {
            vocabularyLength: vocabResponse?.docs?.length || 0,
            vocabulary: vocabResponse?.docs,
          })
        }
      } catch (err) {
        console.error('❌ Fetch error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary')
          setVocabulary([])
          setStats(null)
          setPagination(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounce the fetch
    const timeoutId = setTimeout(fetchData, 300)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [customer?.id]) // Remove options from dependency to prevent infinite re-renders

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
    refetch: refetchVocabulary,
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

  const updateGoal = useCallback(
    async (id: string, data: any) => {
      if (!customer?.id) return

      try {
        const response = await fetch('/api/learning-goals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...data }),
        })

        if (!response.ok) {
          throw new Error('Failed to update goal')
        }

        const result = await response.json()
        await fetchGoals() // Refresh data
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update goal')
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
    updateGoal,
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
