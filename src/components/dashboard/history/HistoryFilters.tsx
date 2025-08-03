'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SortAsc, X, Star, Languages, Clock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslationHistory } from '@/utils/hooks'

type FilterType = 'all' | 'favorites' | 'recent' | 'long'
type SortType = 'newest' | 'oldest' | 'alphabetical' | 'length'

interface HistoryFiltersProps {
  onFiltersChange?: (filters: {
    search: string
    filter: FilterType
    sort: SortType
    advanced?: any
  }) => void
}

export function HistoryFilters({ onFiltersChange }: HistoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get real stats for filter counts
  const { stats } = useTranslationHistory()

  const filters = [
    {
      key: 'all',
      label: 'All Translations',
      count: stats?.totalTranslations || 0,
      icon: Languages,
    },
    { key: 'favorites', label: 'Favorites', count: stats?.favoriteTranslations || 0, icon: Star },
    {
      key: 'recent',
      label: 'Recent (7 days)',
      count: stats?.thisWeekTranslations || 0,
      icon: Clock,
    },
    { key: 'long', label: 'Long Texts', count: 0, icon: Filter }, // This would need calculation
  ]

  // Helper function to notify parent
  const notifyFiltersChange = () => {
    if (onFiltersChange) {
      onFiltersChange({
        search: searchQuery,
        filter: activeFilter,
        sort: sortBy,
      })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setActiveFilter('all')
    setSortBy('newest')
    setTimeout(notifyFiltersChange, 0)
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
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setTimeout(notifyFiltersChange, 0)
                }}
                className="pl-10 bg-neutral-50 border-neutral-200 focus:bg-white"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
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
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as SortType)
                  setTimeout(notifyFiltersChange, 0)
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="length">By Length</SelectItem>
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
              Advanced
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilter === filter.key

              return (
                <Button
                  key={filter.key}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter(filter.key as FilterType)
                    setTimeout(notifyFiltersChange, 0)
                  }}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Date Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Pair */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Language Pair</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en-id">English → Indonesian</SelectItem>
                      <SelectItem value="id-en">Indonesian → English</SelectItem>
                      <SelectItem value="en-es">English → Spanish</SelectItem>
                      <SelectItem value="en-fr">English → French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Translation Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Translation Mode</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Length */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Text Length</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Length</SelectItem>
                      <SelectItem value="short">Short (&lt; 50 chars)</SelectItem>
                      <SelectItem value="medium">Medium (50-200 chars)</SelectItem>
                      <SelectItem value="long">Long (&gt; 200 chars)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-neutral-600">
                  Showing results based on current filters
                </div>
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(searchQuery || activeFilter !== 'all' || sortBy !== 'newest') && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {activeFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filter: {activeFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveFilter('all')} />
                </Badge>
              )}
              {sortBy !== 'newest' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sort: {sortBy}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy('newest')} />
                </Badge>
              )}
            </div>
          )}

          {/* Quick Search Suggestions */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Quick search:</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSearchQuery('hello')}
            >
              &quot;hello&quot;
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSearchQuery('good morning')}
            >
              &quot;good morning&quot;
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSearchQuery('thank you')}
            >
              &quot;thank you&quot;
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
