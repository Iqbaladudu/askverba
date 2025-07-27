'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { PracticeSessions } from '@/payload-types'

export interface PracticeStats {
  totalSessions: number
  totalTimeSpent: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  sessionTypes: {
    flashcard: number
    multiple_choice: number
    fill_blanks: number
    listening: number
    mixed: number
  }
  recentSessions: PracticeSessions[]
  weeklyProgress: Array<{
    date: string
    sessions: number
    averageScore: number
    timeSpent: number
  }>
  performanceTrends: {
    accuracy: Array<{ date: string; value: number }>
    speed: Array<{ date: string; value: number }>
    consistency: Array<{ date: string; value: number }>
  }
  achievements: Array<{
    type: string
    title: string
    description: string
    unlockedAt: string
    icon: string
  }>
}

export interface PracticeStatsFilters {
  timeRange: '7d' | '30d' | '90d' | 'all'
  sessionType?: 'flashcard' | 'multiple_choice' | 'fill_blanks' | 'listening' | 'mixed'
}

export function usePracticeStats(filters: PracticeStatsFilters = { timeRange: '30d' }) {
  const [stats, setStats] = useState<PracticeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters.timeRange, filters.sessionType])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        timeRange: memoizedFilters.timeRange,
        ...(memoizedFilters.sessionType && { sessionType: memoizedFilters.sessionType }),
      })

      const response = await fetch(`/api/practice/stats?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch practice statistics')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch practice statistics')
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters.timeRange, memoizedFilters.sessionType])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refreshStats = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  // Calculate performance insights
  const getPerformanceInsights = useCallback(() => {
    if (!stats) return null

    const insights = []

    // Accuracy insights
    if (stats.averageScore >= 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        message: `Your average accuracy of ${stats.averageScore}% is outstanding!`,
      })
    } else if (stats.averageScore < 70) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        message: `Consider reviewing difficult words more frequently to improve your ${stats.averageScore}% accuracy.`,
      })
    }

    // Streak insights
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'success',
        title: 'Great Consistency',
        message: `You're on a ${stats.currentStreak}-day practice streak! Keep it up!`,
      })
    } else if (stats.currentStreak === 0) {
      insights.push({
        type: 'info',
        title: 'Start Your Streak',
        message: 'Practice today to start building your learning streak!',
      })
    }

    // Session frequency insights
    const avgSessionsPerWeek =
      stats.weeklyProgress.reduce((sum, week) => sum + week.sessions, 0) /
      stats.weeklyProgress.length
    if (avgSessionsPerWeek < 3) {
      insights.push({
        type: 'info',
        title: 'Practice More Regularly',
        message: 'Try to practice at least 3-4 times per week for better retention.',
      })
    }

    return insights
  }, [stats])

  // Get practice recommendations
  const getRecommendations = useCallback(() => {
    if (!stats) return []

    const recommendations = []

    // Recommend practice types based on performance
    const sessionTypes = Object.entries(stats.sessionTypes)
    const leastPracticed = sessionTypes.reduce(
      (min, [type, count]) => (count < min.count ? { type, count } : min),
      { type: '', count: Infinity },
    )

    if (leastPracticed.count < stats.totalSessions * 0.2) {
      recommendations.push({
        type: 'practice_type',
        title: `Try ${leastPracticed.type.replace('_', ' ')} practice`,
        description: `You haven't practiced ${leastPracticed.type.replace('_', ' ')} much. It could help improve your overall skills.`,
        action: `Start ${leastPracticed.type} practice`,
      })
    }

    // Time-based recommendations
    const avgTimePerSession = stats.totalTimeSpent / stats.totalSessions
    if (avgTimePerSession < 300) {
      // Less than 5 minutes
      recommendations.push({
        type: 'duration',
        title: 'Extend your practice sessions',
        description: 'Longer practice sessions can improve retention and learning effectiveness.',
        action: 'Try 10-15 minute sessions',
      })
    }

    // Difficulty recommendations based on accuracy
    if (stats.averageScore > 95) {
      recommendations.push({
        type: 'difficulty',
        title: 'Challenge yourself more',
        description: 'Your accuracy is very high. Try practicing harder words or mixed modes.',
        action: 'Practice hard difficulty words',
      })
    }

    return recommendations
  }, [stats])

  return {
    stats,
    loading,
    error,
    refreshStats,
    getPerformanceInsights,
    getRecommendations,
  }
}
