'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Flame, Target, TrendingUp, Clock, Award } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useUserProgress, useVocabulary, useAchievements } from '@/hooks/usePayloadData'

export function QuickStats() {
  const { progress, loading: progressLoading } = useUserProgress()
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { userAchievements, loading: achievementsLoading } = useAchievements()

  const loading = progressLoading || vocabLoading || achievementsLoading

  // Helper function to format level display
  const formatLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      beginner: 'Beginner',
      elementary: 'Elementary',
      intermediate: 'Intermediate',
      'upper-intermediate': 'Upper Int.',
      advanced: 'Advanced',
      expert: 'Expert',
    }
    return levelMap[level] || 'Beginner'
  }

  // Use real data or fallback to defaults
  const stats = {
    streak: progress?.currentStreak || 0,
    wordsLearned: vocabStats?.totalWords || 0,
    accuracy: progress?.averageAccuracy || 0,
    timeSpent: progress?.todayStudyTimeMinutes || 0,
    level: formatLevel(progress?.currentLevel || 'beginner'),
    achievements: userAchievements?.length || 0,
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">Quick Stats</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-neutral-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-800">Quick Stats</h2>

      {/* Streak Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Daily Streak</p>
                <p className="text-2xl font-bold text-orange-800">{stats.streak}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-200 text-orange-800">
              days
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Words Learned */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Words Learned</p>
                <p className="text-2xl font-bold text-blue-800">{stats.wordsLearned}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
              total
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Accuracy</p>
                  <p className="text-2xl font-bold text-green-800">{stats.accuracy}%</p>
                </div>
              </div>
            </div>
            <Progress value={stats.accuracy} className="h-2 bg-green-200" />
          </div>
        </CardContent>
      </Card>

      {/* Study Time Today */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Study Time</p>
                <p className="text-2xl font-bold text-purple-800">{stats.timeSpent}m</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-200 text-purple-800">
              today
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Level & Achievements */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <div>
                <p className="text-xs text-neutral-600">Level</p>
                <p className="text-sm font-semibold text-neutral-800">{stats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary-500" />
              <div>
                <p className="text-xs text-neutral-600">Badges</p>
                <p className="text-sm font-semibold text-neutral-800">{stats.achievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
