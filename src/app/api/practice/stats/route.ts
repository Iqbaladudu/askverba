import { NextRequest, NextResponse } from 'next/server'
import { practiceAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id
    const timeRange = searchParams.get('timeRange') || '30d'
    const sessionType = searchParams.get('sessionType')

    // Get comprehensive practice statistics
    let stats
    let sessions

    try {
      stats = await practiceAPI.getStats(customerId)
    } catch (error) {
      console.log('No practice stats found, returning default stats')
      stats = {
        totalSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        sessionTypes: {},
      }
    }

    try {
      sessions = await practiceAPI.getByCustomer(customerId, {
        limit: 1000,
        ...(sessionType && { sessionType }),
      })
    } catch (error) {
      console.log('No practice sessions found, returning empty sessions')
      sessions = { docs: [] }
    }

    // Calculate enhanced statistics
    const enhancedStats = calculateEnhancedStats(sessions.docs || [], timeRange)

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        ...enhancedStats,
      },
    })
  } catch (error) {
    console.error('Error in practice stats GET:', error)
    return NextResponse.json({ error: 'Failed to fetch practice stats' }, { status: 500 })
  }
}

function calculateEnhancedStats(sessions: any[], timeRange: string) {
  const now = new Date()
  let startDate = new Date()

  // Calculate date range
  switch (timeRange) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate = new Date(0) // All time
  }

  // Filter sessions by date range
  const filteredSessions = sessions.filter((session) => new Date(session.createdAt) >= startDate)

  // Calculate weekly progress
  const weeklyProgress = calculateWeeklyProgress(filteredSessions)

  // Calculate performance trends
  const performanceTrends = calculatePerformanceTrends(filteredSessions)

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(sessions)

  return {
    weeklyProgress,
    performanceTrends,
    currentStreak,
    longestStreak,
    recentSessions: filteredSessions.slice(0, 10),
  }
}

function calculateWeeklyProgress(sessions: any[]) {
  const weeks = new Map()

  sessions.forEach((session) => {
    const date = new Date(session.createdAt)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        date: weekKey,
        sessions: 0,
        totalScore: 0,
        timeSpent: 0,
      })
    }

    const week = weeks.get(weekKey)
    week.sessions += 1
    week.totalScore += session.score || 0
    week.timeSpent += session.timeSpent || 0
  })

  return Array.from(weeks.values())
    .map((week) => ({
      ...week,
      averageScore: week.sessions > 0 ? Math.round(week.totalScore / week.sessions) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function calculatePerformanceTrends(sessions: any[]) {
  const trends = {
    accuracy: [] as Array<{ date: string; value: number }>,
    speed: [] as Array<{ date: string; value: number }>,
    consistency: [] as Array<{ date: string; value: number }>,
  }

  // Group sessions by day
  const dailyData = new Map()

  sessions.forEach((session) => {
    const date = new Date(session.createdAt).toISOString().split('T')[0]

    if (!dailyData.has(date)) {
      dailyData.set(date, {
        scores: [],
        speeds: [],
        sessions: 0,
      })
    }

    const day = dailyData.get(date)
    day.scores.push(session.score || 0)
    day.speeds.push(session.metadata?.averageTimePerQuestion || 0)
    day.sessions += 1
  })

  // Calculate trends
  dailyData.forEach((data, date) => {
    const avgScore =
      data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length
    const avgSpeed =
      data.speeds.reduce((sum: number, speed: number) => sum + speed, 0) / data.speeds.length
    const consistency = data.sessions // Simple consistency metric

    trends.accuracy.push({ date, value: Math.round(avgScore) })
    trends.speed.push({ date, value: Math.round(avgSpeed) })
    trends.consistency.push({ date, value: consistency })
  })

  return trends
}

function calculateStreaks(sessions: any[]) {
  const sessionDates = sessions
    .map((session) => new Date(session.createdAt).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  // Calculate current streak
  if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
    let checkDate = new Date()
    if (!sessionDates.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (sessionDates.includes(checkDate.toDateString())) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  // Calculate longest streak
  for (let i = 0; i < sessionDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const currentDate = new Date(sessionDates[i])
      const prevDate = new Date(sessionDates[i - 1])
      const diffTime = prevDate.getTime() - currentDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}
