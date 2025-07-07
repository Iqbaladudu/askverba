'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Target, TrendingUp, Flame, Star, Calendar, Award } from 'lucide-react'
import {
  useTranslationHistory,
  useVocabulary,
  useUserProgress,
  useUserPreferences,
  useAchievements,
} from '@/hooks/usePayloadData'

export function AnalyticsOverview() {
  const { history, loading: historyLoading } = useTranslationHistory()
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { progress, loading: progressLoading } = useUserProgress()
  const { preferences, loading: prefsLoading } = useUserPreferences()
  const { userAchievements, loading: achievementsLoading } = useAchievements()

  const loading =
    historyLoading || vocabLoading || progressLoading || prefsLoading || achievementsLoading

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-800">
            Analytics Overview
          </CardTitle>
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

  // Calculate real stats from database data
  const stats = {
    totalStudyTime: progress?.totalStudyTimeHours || 0,
    wordsLearned: vocabStats?.totalWords || 0,
    translationsCount: (history || []).length,
    currentStreak: progress?.currentStreak || 0,
    averageAccuracy: progress?.averageAccuracy || 0,
    weeklyGoalProgress: Math.min(
      100,
      ((vocabStats?.totalWords || 0) / (preferences?.weeklyGoalWords || 20)) * 100,
    ),
    monthlyGoalProgress: Math.min(
      100,
      ((vocabStats?.masteredWords || 0) / (preferences?.monthlyGoalWords || 100)) * 100,
    ),
    achievements: (userAchievements || []).length,
  }

  const formatStudyTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${Math.round(hours)}h`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Study Time */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Study Time</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatStudyTime(stats.totalStudyTime)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {progress?.weeklyStudyTimeIncrease
                ? `+${progress.weeklyStudyTimeIncrease.toFixed(1)}h this week`
                : 'Building study time'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Words Learned */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Words Learned</p>
                <p className="text-2xl font-bold text-green-800">{stats.wordsLearned}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {progress?.weeklyWordsIncrease
                ? `+${progress.weeklyWordsIncrease} this week`
                : 'Building vocabulary'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Translations */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Translations</p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.translationsCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +89 this week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Current Streak</p>
                <p className="text-2xl font-bold text-orange-800">{stats.currentStreak} days</p>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-orange-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Best: 15 days
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Progress Cards */}
      <Card className="border-0 shadow-sm md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Accuracy & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Average Accuracy */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Average Accuracy</span>
                <span className="font-medium">{stats.averageAccuracy}%</span>
              </div>
              <Progress value={stats.averageAccuracy} className="h-2" />
            </div>

            {/* Recent Performance */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-neutral-600">Best Session</p>
                <p className="font-medium text-green-600">98% accuracy</p>
              </div>
              <div className="space-y-1">
                <p className="text-neutral-600">Improvement</p>
                <p className="font-medium text-blue-600">+8% this month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card className="border-0 shadow-sm md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weekly Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Weekly Goal (20 words)</span>
                <span className="font-medium">{stats.weeklyGoalProgress}%</span>
              </div>
              <Progress value={stats.weeklyGoalProgress} className="h-2" />
              <p className="text-xs text-neutral-500">15 of 20 words completed</p>
            </div>

            {/* Monthly Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Monthly Goal (80 words)</span>
                <span className="font-medium">{stats.monthlyGoalProgress}%</span>
              </div>
              <Progress value={stats.monthlyGoalProgress} className="h-2" />
              <p className="text-xs text-neutral-500">48 of 80 words completed</p>
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-neutral-600">Achievements Unlocked</span>
              </div>
              <span className="font-medium text-yellow-600">{stats.achievements}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
