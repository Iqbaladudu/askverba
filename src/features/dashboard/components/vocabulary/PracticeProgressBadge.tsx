'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, TrendingUp, AlertCircle } from 'lucide-react'

interface PracticeProgressBadgeProps {
  practiceCount: number
  accuracy: number
  lastPracticed: string | null
  status: string
}

export function PracticeProgressBadge({ 
  practiceCount, 
  accuracy, 
  lastPracticed, 
  status 
}: PracticeProgressBadgeProps) {
  // Calculate practice status based on data
  const getPracticeStatus = () => {
    if (practiceCount === 0) {
      return {
        label: 'Never Practiced',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: AlertCircle,
        priority: 'high'
      }
    }

    const daysSinceLastPractice = lastPracticed 
      ? Math.floor((Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    if (daysSinceLastPractice > 7) {
      return {
        label: 'Needs Practice',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        priority: 'high'
      }
    }

    if (accuracy < 60) {
      return {
        label: 'Struggling',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Target,
        priority: 'medium'
      }
    }

    if (daysSinceLastPractice <= 1) {
      return {
        label: 'Recently Practiced',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: TrendingUp,
        priority: 'low'
      }
    }

    if (accuracy >= 80 && practiceCount >= 5) {
      return {
        label: 'Well Practiced',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Target,
        priority: 'low'
      }
    }

    return {
      label: 'In Progress',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Clock,
      priority: 'medium'
    }
  }

  const practiceStatus = getPracticeStatus()
  const Icon = practiceStatus.icon

  return (
    <div className="space-y-2">
      {/* Practice Status Badge */}
      <Badge 
        variant="outline" 
        className={`${practiceStatus.color} text-xs font-medium`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {practiceStatus.label}
      </Badge>

      {/* Practice Stats */}
      <div className="text-xs text-neutral-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Practice Count:</span>
          <span className="font-medium">{practiceCount}</span>
        </div>
        
        {accuracy > 0 && (
          <div className="flex items-center justify-between">
            <span>Accuracy:</span>
            <span className={`font-medium ${
              accuracy >= 80 ? 'text-green-600' : 
              accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {accuracy}%
            </span>
          </div>
        )}

        {lastPracticed && (
          <div className="flex items-center justify-between">
            <span>Last Practice:</span>
            <span className="font-medium">
              {new Date(lastPracticed).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get practice priority for sorting
export function getPracticePriority(
  practiceCount: number,
  accuracy: number,
  lastPracticed: string | null
): 'high' | 'medium' | 'low' {
  if (practiceCount === 0) return 'high'
  
  const daysSinceLastPractice = lastPracticed 
    ? Math.floor((Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  if (daysSinceLastPractice > 7 || accuracy < 60) return 'high'
  if (accuracy >= 80 && practiceCount >= 5) return 'low'
  
  return 'medium'
}
