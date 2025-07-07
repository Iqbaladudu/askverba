'use client'

import React, { useState } from 'react'
import { HistoryHeader } from '@/components/dashboard/history/HistoryHeader'
import { HistoryFilters } from '@/components/dashboard/history/HistoryFilters'
import { HistoryList } from '@/components/dashboard/history/HistoryList'
import { HistoryStats } from '@/components/dashboard/history/HistoryStats'

type FilterType = 'all' | 'favorites' | 'recent' | 'long'
type SortType = 'newest' | 'oldest' | 'alphabetical' | 'length'

export default function HistoryPage() {
  const [filters, setFilters] = useState({
    search: '',
    filter: 'all' as FilterType,
    sort: 'newest' as SortType,
  })
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const handleFiltersChange = (newFilters: {
    search: string
    filter: FilterType
    sort: SortType
    advanced?: any
  }) => {
    setFilters({
      search: newFilters.search,
      filter: newFilters.filter,
      sort: newFilters.sort,
    })
  }

  const handleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch)
    // TODO: Implement advanced search modal/panel
    console.log('Advanced search toggled:', !showAdvancedSearch)
  }

  const handleToggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HistoryHeader
        onAdvancedSearch={handleAdvancedSearch}
        onToggleFilters={handleToggleFilters}
      />

      {/* Stats Overview */}
      <HistoryStats />

      {/* Filters and Search */}
      {showFilters && <HistoryFilters onFiltersChange={handleFiltersChange} />}

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Advanced Search</h3>
          <p className="text-blue-600 text-sm">
            Advanced search functionality will be implemented here. Features: Date range, language
            filter, text length, etc.
          </p>
        </div>
      )}

      {/* History List */}
      <HistoryList filters={filters} />
    </div>
  )
}
