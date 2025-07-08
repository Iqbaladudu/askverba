'use client'

import React, { useState, useCallback } from 'react'
import { VocabularyHeader } from '@/components/dashboard/vocabulary/VocabularyHeader'
import { VocabularyStats } from '@/components/dashboard/vocabulary/VocabularyStats'
import { VocabularyList } from '@/components/dashboard/vocabulary/VocabularyList'
import { VocabularyFilters } from '@/components/dashboard/vocabulary/VocabularyFilters'

export interface VocabularyFilters {
  search?: string
  status?: 'all' | 'new' | 'learning' | 'mastered'
  difficulty?: 'all' | 'easy' | 'medium' | 'hard'
  sortBy?: 'createdAt' | 'word' | 'difficulty' | 'lastPracticed'
  sortOrder?: 'asc' | 'desc'
  dateRange?: 'all' | 'today' | 'week' | 'month'
  page?: number
  limit?: number
}

export default function VocabularyPage() {
  const [filters, setFilters] = useState<VocabularyFilters>({
    search: '',
    status: 'all',
    difficulty: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: 'all',
    page: 1,
    limit: 20,
  })

  const handleFiltersChange = useCallback((newFilters: Partial<VocabularyFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when changing page)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Debug Component - Remove in production */}
      {/* <VocabularyDebug /> */}

      {/* Header */}
      <VocabularyHeader />

      {/* Stats Overview */}
      <VocabularyStats />

      {/* Filters and Search */}
      {/* <VocabularyFilters filters={filters} onFiltersChange={handleFiltersChange} /> */}

      {/* Vocabulary List */}
      <VocabularyList />
    </div>
  )
}
