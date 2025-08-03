'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Clock, Target, BookOpen, Brain, Zap, Calendar } from 'lucide-react'
import { useAuth } from '@/features/auth/contexts'
import { useVocabulary } from '@/utils/hooks'
import { useDashboardStats } from '@/utils/hooks'
import Link from 'next/link'

export function DashboardWelcome() {
  const { customer } = useAuth()
  const { stats: vocabStats } = useVocabulary()
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats()

  // Get current time for greeting
  const currentHour = new Date().getHours()
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning'
    if (currentHour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Use real data from dashboard stats
  const learningStreak = dashboardStats?.learningStreak || 0
  const todayGoal = dashboardStats?.todayGoal || 10
  const todayProgress = dashboardStats?.todayProgress || 0

  return (
    <div className="space-y-6">
      {/* Main Welcome Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

        <CardContent className="p-6 sm:p-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-200" />
                  <Badge className="bg-white/20 text-white border-white/30 font-medium text-xs sm:text-sm">
                    {getGreeting()}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Welcome back, {customer?.name || 'Learner'}!
                </h1>
                <p className="text-primary-100 text-base sm:text-lg">
                  Ready to continue your language learning journey?
                </p>
              </div>

              <div className="flex items-center gap-2 text-primary-100">
                <Calendar className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{currentDate}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center lg:justify-end gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-primary-200" />
                  <span className="text-xs sm:text-sm text-primary-200">Vocabulary</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{vocabStats?.totalWords || 0}</div>
                <div className="text-xs text-primary-200">words learned</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center lg:justify-end gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary-200" />
                  <span className="text-xs sm:text-sm text-primary-200">Streak</span>
                </div>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 sm:h-8 bg-white/20 rounded w-8 sm:w-12 mb-1"></div>
                    <div className="h-3 bg-white/20 rounded w-6 sm:w-8"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl font-bold">{learningStreak}</div>
                    <div className="text-xs text-primary-200">days</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Goal */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            {statsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-green-200 rounded w-20"></div>
                      <div className="h-3 bg-green-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-green-200 rounded w-12"></div>
                </div>
                <div className="h-2 bg-green-200 rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 text-sm sm:text-base">
                        Today&apos;s Goal
                      </h3>
                      <p className="text-xs sm:text-sm text-green-600 truncate">
                        {todayProgress}/{todayGoal} words
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-200 text-green-800 text-xs sm:text-sm font-semibold px-2 py-1">
                    {Math.round((todayProgress / todayGoal) * 100)}%
                  </Badge>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((todayProgress / todayGoal) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Learning Streak */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-orange-200 rounded w-24"></div>
                      <div className="h-3 bg-orange-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-8 bg-orange-200 rounded w-8"></div>
                    <div className="h-3 bg-orange-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-orange-800 text-sm sm:text-base">
                      Learning Streak
                    </h3>
                    <p className="text-xs sm:text-sm text-orange-600">
                      {learningStreak > 0 ? 'Keep it going!' : 'Start your streak!'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-orange-700">
                    {learningStreak}
                  </div>
                  <div className="text-xs text-orange-600">days</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Practice */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-purple-800 text-sm sm:text-base">
                    Quick Practice
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-600">Test your knowledge</p>
                </div>
              </div>
              <Link href="/dashboard/practice">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4"
                >
                  Start
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
