'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Star, Target, TrendingUp, Clock, Flame } from 'lucide-react'
import {
  useVocabulary,
  useUserPreferences,
  useUserProgress,
  usePractice,
} from '@/hooks/usePayloadData'

export function VocabularyStats() {
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { preferences, loading: prefsLoading } = useUserPreferences()
  const { progress, loading: progressLoading } = useUserProgress()
  const { stats: practiceStats, loading: practiceLoading } = usePractice()

  const loading = vocabLoading || prefsLoading || progressLoading || practiceLoading

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-neutral-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Use real data or fallback to defaults
  const stats = {
    totalWords: vocabStats?.totalWords || 0,
    masteredWords: vocabStats?.masteredWords || 0,
    learningWords: vocabStats?.learningWords || 0,
    newWords: vocabStats?.newWords || 0,
    weeklyGoal: preferences?.weeklyGoalWords || 20,
    weeklyProgress: Math.min(vocabStats?.totalWords || 0, preferences?.weeklyGoalWords || 20),
    averageAccuracy: practiceStats?.averageScore || progress?.averageAccuracy || 0,
    studyStreak: practiceStats?.currentStreak || progress?.currentStreak || 0,
    totalPracticeSessions: practiceStats?.totalSessions || 0,
    totalPracticeTime: practiceStats?.totalTimeSpent || 0,
  }

  const masteryPercentage =
    stats.totalWords > 0 ? Math.round((stats.masteredWords / stats.totalWords) * 100) : 0
  const weeklyPercentage =
    stats.weeklyGoal > 0 ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Words */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Words</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalWords}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mastered Words */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Mastered</p>
                  <p className="text-2xl font-bold text-green-800">{stats.masteredWords}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-green-700">
                <span>Progress</span>
                <span>{masteryPercentage}%</span>
              </div>
              <Progress value={masteryPercentage} className="h-2 bg-green-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Weekly Goal</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {stats.weeklyProgress}/{stats.weeklyGoal}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-purple-700">
                <span>This week</span>
                <span>{weeklyPercentage}%</span>
              </div>
              <Progress value={weeklyPercentage} className="h-2 bg-purple-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Study Streak</p>
                <p className="text-2xl font-bold text-orange-800">{stats.studyStreak}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <Card className="border-0 shadow-sm md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Learning Status Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Learning Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Mastered</span>
                  </div>
                  <span className="font-medium">{stats.masteredWords}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Learning</span>
                  </div>
                  <span className="font-medium">{stats.learningWords}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>New</span>
                  </div>
                  <span className="font-medium">{stats.newWords}</span>
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Average Accuracy</h4>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-neutral-800">{stats.averageAccuracy}%</div>
                <Progress value={stats.averageAccuracy} className="h-2" />
                <p className="text-xs text-neutral-500">Based on practice sessions</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Practice Activity</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Total sessions: {stats.totalPracticeSessions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Time spent: {Math.round(stats.totalPracticeTime / 60)} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  <span>Average score: {stats.averageAccuracy}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
