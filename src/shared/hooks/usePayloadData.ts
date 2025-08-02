'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/features/auth/contexts'
import { translationHistoryAPI } from '@/infrastructure/api/client'

// Vocabulary Hook
export function useVocabulary(options?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  difficulty?: string
}) {
  const { customer } = useAuth()
  const [vocabulary, setVocabulary] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(
    () => options || {},
    [options?.page, options?.limit, options?.search, options?.status, options?.difficulty],
  )

  // Create a simple refetch function for CRUD operations
  const refetchVocabulary = useCallback(
    async (customOptions?: typeof options) => {
      if (!customer?.id) return

      // console.log('🔄 Manual refetch triggered')

      try {
        setLoading(true)
        setError(null)

        // Fetch fresh data immediately
        const { getUserVocabularyWithOptions, getVocabularyStats } = await import(
          '@/features/vocabulary/services/vocabularyService'
        )

        const queryOptions = customOptions || memoizedOptions
        const [vocabResponse, statsData] = await Promise.all([
          getUserVocabularyWithOptions(customer.id, queryOptions),
          getVocabularyStats(customer.id),
        ])

        // console.log('🔄 Refetch results:', {
        //   vocabDocsLength: vocabResponse?.docs?.length || 0,
        //   vocabResponse,
        //   statsData,
        // })

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
    },
    [customer?.id],
  )

  const addWord = useCallback(
    async (data: any) => {
      if (!customer?.id) return

      try {
        const { createVocabularyEntry } = await import(
          '@/features/vocabulary/services/vocabularyService'
        )
        const response = await createVocabularyEntry(customer.id, data)
        refetchVocabulary() // Refresh data
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add word'

        // Check if it's a duplicate error and provide better messaging
        if (errorMessage.includes('already exists')) {
          const duplicateError = new Error(errorMessage)
          duplicateError.name = 'DuplicateVocabularyError'
          setError(errorMessage)
          throw duplicateError
        }

        setError(errorMessage)
        throw err
      }
    },
    [customer?.id, refetchVocabulary],
  )

  const updateWord = useCallback(
    async (id: string, data: any) => {
      if (!customer?.id) return
      try {
        const { updateVocabularyEntry } = await import(
          '@/features/vocabulary/services/vocabularyService'
        )
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
        const { deleteVocabularyEntry } = await import(
          '@/features/vocabulary/services/vocabularyService'
        )
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
        const { getUserVocabularyWithOptions, getVocabularyStats } = await import(
          '@/features/vocabulary/services/vocabularyService'
        )

        // Fetch data
        const [vocabResponse, statsData] = await Promise.all([
          getUserVocabularyWithOptions(customer.id, memoizedOptions),
          getVocabularyStats(customer.id),
        ])

        // Only update state if component is still mounted
        if (isMounted) {
          // console.log('✅ Setting vocabulary state:', vocabResponse?.docs?.length || 0, 'items')

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
          // console.log('📊 Final vocabulary state set:', {
          //   vocabularyLength: vocabResponse?.docs?.length || 0,
          //   vocabulary: vocabResponse?.docs,
          // })
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
  }, [customer?.id, memoizedOptions])

  // Function to change page
  const changePage = useCallback(
    (page: number) => {
      refetchVocabulary({ ...memoizedOptions, page })
    },
    [refetchVocabulary, memoizedOptions],
  )

  // Function to change page size
  const changePageSize = useCallback(
    (limit: number) => {
      refetchVocabulary({ ...memoizedOptions, limit, page: 1 })
    },
    [refetchVocabulary, memoizedOptions],
  )

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
    changePage,
    changePageSize,
  }
}

// Translation History Hook
export function useTranslationHistory(
  options: {
    page?: number
    limit?: number
    search?: string
    mode?: 'simple' | 'detailed'
    isFavorite?: boolean
    dateFrom?: string
    dateTo?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {},
) {
  const { customer } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

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
      setPagination({
        totalDocs: historyResponse.totalDocs || 0,
        limit: historyResponse.limit || 20,
        page: historyResponse.page || 1,
        totalPages: historyResponse.totalPages || 0,
        hasNextPage: historyResponse.hasNextPage || false,
        hasPrevPage: historyResponse.hasPrevPage || false,
      })
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

  // Function to change page
  const changePage = useCallback(
    (page: number) => {
      fetchHistory()
    },
    [fetchHistory],
  )

  // Function to change page size
  const changePageSize = useCallback(
    (limit: number) => {
      fetchHistory()
    },
    [fetchHistory],
  )

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    stats,
    pagination,
    loading,
    error,
    addTranslation,
    updateTranslation,
    toggleFavorite,
    deleteTranslation,
    refetch: fetchHistory,
    changePage,
    changePageSize,
  }
}
