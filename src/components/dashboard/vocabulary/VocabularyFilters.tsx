'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SortAsc, X, Calendar, Star, BookOpen } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVocabulary } from '@/hooks/usePayloadData'
import { VocabularyFilters as VocabularyFiltersType } from '@/app/(app)/dashboard/vocabulary/page'

interface VocabularyFiltersProps {
  filters: VocabularyFiltersType
  onFiltersChange: (filters: Partial<VocabularyFiltersType>) => void
}

export function VocabularyFilters({ filters, onFiltersChange }: VocabularyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { stats } = useVocabulary({ limit: 1 }) // Just get stats

  const filterTabs = [
    {
      key: 'all',
      label: 'All Words',
      count: stats?.totalWords || 0,
      icon: BookOpen,
    },
    {
      key: 'mastered',
      label: 'Mastered',
      count: stats?.masteredWords || 0,
      icon: Star,
    },
    {
      key: 'learning',
      label: 'Learning',
      count: stats?.learningWords || 0,
      icon: BookOpen,
    },
    {
      key: 'new',
      label: 'New',
      count: stats?.newWords || 0,
      icon: BookOpen,
    },
  ]

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      difficulty: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      dateRange: 'all',
      page: 1,
    })
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Sort Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search vocabulary..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ search: '' })}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-neutral-500" />
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc']
                  onFiltersChange({ sortBy: sortBy as any, sortOrder })
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Date Added (Newest)</SelectItem>
                  <SelectItem value="createdAt-asc">Date Added (Oldest)</SelectItem>
                  <SelectItem value="word-asc">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="word-desc">Alphabetical (Z-A)</SelectItem>
                  <SelectItem value="difficulty-asc">Difficulty (Easy First)</SelectItem>
                  <SelectItem value="difficulty-desc">Difficulty (Hard First)</SelectItem>
                  <SelectItem value="lastPracticed-desc">Recently Practiced</SelectItem>
                  <SelectItem value="lastPracticed-asc">Least Practiced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((filter) => {
              const Icon = filter.icon
              const isActive = filters.status === filter.key

              return (
                <Button
                  key={filter.key}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    onFiltersChange({
                      status: filter.key as 'all' | 'new' | 'learning' | 'mastered',
                    })
                  }
                  className={`flex items-center gap-2 ${
                    isActive ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {filter.label}
                  <Badge
                    variant="secondary"
                    className={`ml-1 ${
                      isActive ? 'bg-primary-400 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {filter.count}
                  </Badge>
                </Button>
              )
            })}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Difficulty</label>
                  <Select
                    value={filters.difficulty || 'all'}
                    onValueChange={(value) => onFiltersChange({ difficulty: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Date Added</label>
                  <Select
                    value={filters.dateRange || 'all'}
                    onValueChange={(value) => onFiltersChange({ dateRange: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Language</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en-id">English → Indonesian</SelectItem>
                      <SelectItem value="id-en">Indonesian → English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(filters.search ||
            filters.status !== 'all' ||
            filters.difficulty !== 'all' ||
            filters.dateRange !== 'all' ||
            filters.sortBy !== 'createdAt') && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Active filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ search: '' })}
                  />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ status: 'all' })}
                  />
                </Badge>
              )}
              {filters.difficulty !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Difficulty: {filters.difficulty}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ difficulty: 'all' })}
                  />
                </Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {filters.dateRange}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ dateRange: 'all' })}
                  />
                </Badge>
              )}
              {filters.sortBy !== 'createdAt' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sort: {filters.sortBy} ({filters.sortOrder})
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ sortBy: 'createdAt', sortOrder: 'desc' })}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
