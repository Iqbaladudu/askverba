'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/contexts'

interface DashboardStats {
  learningStreak: number
  todayGoal: number
  todayProgress: number
  totalSessions: number
  averageScore: number
  lastActivityDate: string | null
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { customer } = useAuth()

  useEffect(() => {
    if (!customer?.id) {
      setLoading(false)
      return
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch practice sessions for streak calculation
        const practiceResponse = await fetch('/api/practice/stats')
        const practiceData = await practiceResponse.json()

        // Fetch vocabulary stats for today's progress
        const vocabResponse = await fetch('/api/vocabulary/stats')
        const vocabData = await vocabResponse.json()

        // Calculate learning streak based on practice sessions
        const calculateStreak = (sessions: any[]) => {
          if (!sessions || sessions.length === 0) return 0

          const sortedSessions = sessions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

          let streak = 0
          let currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)

          for (const session of sortedSessions) {
            const sessionDate = new Date(session.createdAt)
            sessionDate.setHours(0, 0, 0, 0)

            const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysDiff === streak) {
              streak++
            } else if (daysDiff === streak + 1 && streak === 0) {
              // Allow for today or yesterday to start streak
              streak++
            } else {
              break
            }

            currentDate = new Date(sessionDate)
          }

          return streak
        }

        // Calculate today's progress based on vocabulary added today
        const calculateTodayProgress = (vocabulary: any[]) => {
          if (!vocabulary || vocabulary.length === 0) return 0

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          return vocabulary.filter(word => {
            const wordDate = new Date(word.createdAt)
            wordDate.setHours(0, 0, 0, 0)
            return wordDate.getTime() === today.getTime()
          }).length
        }

        const learningStreak = calculateStreak(practiceData.sessions || [])
        const todayProgress = calculateTodayProgress(vocabData.vocabulary || [])
        const todayGoal = Math.max(10, Math.floor((vocabData.totalWords || 0) / 30) + 5) // Dynamic goal based on total words

        setStats({
          learningStreak,
          todayGoal,
          todayProgress,
          totalSessions: practiceData.totalSessions || 0,
          averageScore: practiceData.averageScore || 0,
          lastActivityDate: practiceData.sessions?.[0]?.createdAt || null
        })

      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
        // Set default values on error
        setStats({
          learningStreak: 0,
          todayGoal: 10,
          todayProgress: 0,
          totalSessions: 0,
          averageScore: 0,
          lastActivityDate: null
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [customer?.id])

  return {
    stats,
    loading,
    error,
    refetch: () => {
      if (customer?.id) {
        setLoading(true)
        // Re-trigger the effect
        setStats(null)
      }
    }
  }
}
