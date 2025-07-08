'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react'

interface PracticeFilterProps {
  onFilterChange: (filter: string) => void
  currentFilter: string
}

export function PracticeFilter({ onFilterChange, currentFilter }: PracticeFilterProps) {
  const filterOptions = [
    {
      id: 'all',
      name: 'All Words',
      description: 'Show all vocabulary',
      icon: Filter,
      color: 'text-neutral-600',
      count: 0, // Will be calculated by parent
    },
    {
      id: 'needs_practice',
      name: 'Needs Practice',
      description: 'Never practiced or >7 days ago',
      icon: AlertCircle,
      color: 'text-red-600',
      priority: 'high',
    },
    {
      id: 'struggling',
      name: 'Struggling',
      description: 'Low accuracy (<60%)',
      icon: Clock,
      color: 'text-orange-600',
      priority: 'medium',
    },
    {
      id: 'well_practiced',
      name: 'Well Practiced',
      description: 'High accuracy (≥80%) & practiced ≥5 times',
      icon: CheckCircle,
      color: 'text-green-600',
      priority: 'low',
    },
    {
      id: 'recent',
      name: 'Recently Practiced',
      description: 'Practiced within last 24 hours',
      icon: Clock,
      color: 'text-blue-600',
      priority: 'low',
    },
  ]

  const getCurrentFilterName = () => {
    const filter = filterOptions.find(f => f.id === currentFilter)
    return filter?.name || 'All Words'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {getCurrentFilterName()}
          {currentFilter !== 'all' && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Active
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Filter by Practice Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {filterOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`flex items-start gap-3 p-3 ${
              currentFilter === option.id ? 'bg-primary-50' : ''
            }`}
          >
            <option.icon className={`h-4 w-4 mt-0.5 ${option.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{option.name}</span>
                {currentFilter === option.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{option.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Helper function to filter vocabulary items based on practice status
export function filterVocabularyByPractice(items: any[], filter: string) {
  if (filter === 'all') return items

  return items.filter(item => {
    const practiceCount = item.practiceCount || 0
    const accuracy = item.accuracy || 0
    const lastPracticed = item.lastPracticed
    
    const daysSinceLastPractice = lastPracticed 
      ? Math.floor((Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    switch (filter) {
      case 'needs_practice':
        return practiceCount === 0 || daysSinceLastPractice > 7
      
      case 'struggling':
        return practiceCount > 0 && accuracy < 60
      
      case 'well_practiced':
        return accuracy >= 80 && practiceCount >= 5
      
      case 'recent':
        return daysSinceLastPractice <= 1
      
      default:
        return true
    }
  })
}

// Helper function to sort vocabulary by practice priority
export function sortVocabularyByPracticePriority(items: any[]) {
  return items.sort((a, b) => {
    const getPriority = (item: any) => {
      const practiceCount = item.practiceCount || 0
      const accuracy = item.accuracy || 0
      const lastPracticed = item.lastPracticed
      
      if (practiceCount === 0) return 3 // Highest priority
      
      const daysSinceLastPractice = lastPracticed 
        ? Math.floor((Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      if (daysSinceLastPractice > 7 || accuracy < 60) return 3 // High priority
      if (accuracy >= 80 && practiceCount >= 5) return 1 // Low priority
      
      return 2 // Medium priority
    }

    return getPriority(b) - getPriority(a) // Sort by priority (high to low)
  })
}
