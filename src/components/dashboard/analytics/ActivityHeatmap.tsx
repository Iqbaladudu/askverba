'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flame, Clock } from 'lucide-react'
import { useTranslationHistory, useUserProgress, useVocabulary } from '@/hooks/usePayloadData'

export function ActivityHeatmap() {
  const { history, loading: historyLoading } = useTranslationHistory()
  const { progress, loading: progressLoading } = useUserProgress()
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()

  const loading = historyLoading || progressLoading || vocabLoading

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-800">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate real data for the last 12 weeks (84 days) based on translation history
  const generateHeatmapData = () => {
    const data = []
    const today = new Date()

    for (let i = 83; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      // Filter translations for this day
      const dayTranslations = (history || []).filter((item: any) => {
        const itemDate = new Date(item.createdAt)
        return itemDate.toDateString() === date.toDateString()
      })

      // Calculate activity level based on translations count
      const translationsCount = dayTranslations.length
      let activity = 0
      if (translationsCount > 0) {
        if (translationsCount >= 20) activity = 4
        else if (translationsCount >= 15) activity = 3
        else if (translationsCount >= 10) activity = 2
        else if (translationsCount >= 5) activity = 1
        else activity = 1
      }

      // Calculate words learned (estimate 2-3 words per translation)
      const words = translationsCount * 2.5

      // Calculate study time (estimate 3-5 minutes per translation)
      const studyTime = translationsCount * 4

      data.push({
        date: dateString,
        activity,
        words: Math.round(words),
        studyTime: Math.round(studyTime),
        translationsCount,
      })
    }

    return data
  }

  const heatmapData = generateHeatmapData()
  const weeks = []

  // Group data into weeks
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7))
  }

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-neutral-100'
      case 1:
        return 'bg-green-200'
      case 2:
        return 'bg-green-300'
      case 3:
        return 'bg-green-400'
      case 4:
        return 'bg-green-500'
      default:
        return 'bg-neutral-100'
    }
  }

  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[dayIndex]
  }

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  // Calculate real stats from data
  const totalDays = heatmapData.length
  const activeDays = heatmapData.filter((d) => d.activity > 0).length

  // Use real streak data from user progress if available
  const currentStreak =
    progress?.currentStreak ||
    (() => {
      let streak = 0
      for (let i = heatmapData.length - 1; i >= 0; i--) {
        if (heatmapData[i].activity > 0) {
          streak++
        } else {
          break
        }
      }
      return streak
    })()

  const longestStreak =
    progress?.longestStreak ||
    (() => {
      let maxStreak = 0
      let currentStreakCalc = 0

      heatmapData.forEach((day) => {
        if (day.activity > 0) {
          currentStreakCalc++
          maxStreak = Math.max(maxStreak, currentStreakCalc)
        } else {
          currentStreakCalc = 0
        }
      })

      return maxStreak
    })()

  // Calculate real insights from data
  const calculateInsights = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayActivity = Array(7).fill(0)
    const dayCount = Array(7).fill(0)

    heatmapData.forEach((day) => {
      const dayOfWeek = new Date(day.date).getDay()
      dayActivity[dayOfWeek] += day.activity
      if (day.activity > 0) dayCount[dayOfWeek]++
    })

    // Find most active day
    const avgDayActivity = dayActivity.map((total, index) =>
      dayCount[index] > 0 ? total / dayCount[index] : 0,
    )
    const mostActiveDayIndex = avgDayActivity.indexOf(Math.max(...avgDayActivity))
    const mostActiveDay = dayNames[mostActiveDayIndex]

    // Find best week (week with most active days)
    const weeklyActivity = []
    for (let i = 0; i < weeks.length; i++) {
      const weekActiveDays = weeks[i].filter((day) => day.activity > 0).length
      weeklyActivity.push({
        weekIndex: i,
        activeDays: weekActiveDays,
        startDate: weeks[i][0]?.date,
      })
    }

    const bestWeek = weeklyActivity.reduce(
      (best, current) => (current.activeDays > best.activeDays ? current : best),
      { activeDays: 0, startDate: null },
    )

    // Find longest break
    let longestBreak = 0
    let currentBreak = 0
    let breakStart = null
    let breakEnd = null
    let longestBreakStart = null
    let longestBreakEnd = null

    heatmapData.forEach((day, index) => {
      if (day.activity === 0) {
        if (currentBreak === 0) {
          breakStart = day.date
        }
        currentBreak++
        breakEnd = day.date
      } else {
        if (currentBreak > longestBreak) {
          longestBreak = currentBreak
          longestBreakStart = breakStart
          longestBreakEnd = breakEnd
        }
        currentBreak = 0
      }
    })

    // Final check for break at the end
    if (currentBreak > longestBreak) {
      longestBreak = currentBreak
      longestBreakStart = breakStart
      longestBreakEnd = breakEnd
    }

    return {
      mostActiveDay,
      bestWeek,
      longestBreak,
      longestBreakStart,
      longestBreakEnd,
      averageDaysPerWeek: Math.round((activeDays / 12) * 10) / 10,
    }
  }

  const insights = calculateInsights()

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Activity Heatmap
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Last 12 weeks
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-lg font-bold text-neutral-800">{activeDays}</div>
              <div className="text-xs text-neutral-600">Active Days</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {Math.round((activeDays / totalDays) * 100)}%
              </div>
              <div className="text-xs text-neutral-600">Consistency</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                <Flame className="h-4 w-4" />
                {currentStreak}
              </div>
              <div className="text-xs text-neutral-600">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{longestStreak}</div>
              <div className="text-xs text-neutral-600">Best Streak</div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-700">Daily Activity</h4>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Month labels */}
            <div className="flex justify-between text-xs text-neutral-500 mb-2">
              {weeks
                .map((week, index) => {
                  if (index % 4 === 0 && week[0]) {
                    return <span key={index}>{getMonthName(week[0].date)}</span>
                  }
                  return null
                })
                .filter(Boolean)}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-2">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
                  <div key={index} className="h-3 text-xs text-neutral-500 flex items-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap cells */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${getActivityColor(day.activity)} hover:ring-2 hover:ring-neutral-300 cursor-pointer transition-all`}
                        title={`${day.date}: ${day.words} words, ${day.studyTime} minutes`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Insights */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h4 className="text-sm font-medium text-neutral-700">Activity Insights</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Most Active Day:</span>
                  <span>{insights.mostActiveDay || 'No data yet'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Best Week:</span>
                  <span>
                    {insights.bestWeek.startDate
                      ? `Week of ${new Date(insights.bestWeek.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${insights.bestWeek.activeDays}/7 days)`
                      : 'No data yet'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Longest Break:</span>
                  <span>
                    {insights.longestBreak > 0
                      ? `${insights.longestBreak} days${insights.longestBreakStart ? ` (${new Date(insights.longestBreakStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}`
                      : 'No breaks yet'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Average:</span>
                  <span>{insights.averageDaysPerWeek} days/week</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Tip:</span>
                {(insights.mostActiveDay && insights.mostActiveDay.includes('Saturday')) ||
                insights.mostActiveDay.includes('Sunday')
                  ? " You're most consistent on weekends! Try setting a reminder for weekday study sessions to improve your overall consistency."
                  : insights.averageDaysPerWeek >= 5
                    ? ' Great consistency! Keep up the excellent daily study habit.'
                    : ' Try to establish a more regular study routine. Consistency is key to language learning success!'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
