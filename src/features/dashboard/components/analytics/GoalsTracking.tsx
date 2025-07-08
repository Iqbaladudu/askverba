'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, Edit, Check, Clock, Calendar, Trophy, Star } from 'lucide-react'
import {
  useTranslationHistory,
  useVocabulary,
  useUserProgress,
  useUserPreferences,
} from '@/hooks/usePayloadData'

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  category: 'daily' | 'weekly' | 'monthly' | 'custom'
  status: 'active' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
}

export function GoalsTracking() {
  const { history, loading: historyLoading } = useTranslationHistory()
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { progress, loading: progressLoading } = useUserProgress()
  const { preferences, loading: prefsLoading } = useUserPreferences()

  const loading = historyLoading || vocabLoading || progressLoading || prefsLoading

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-800">Goals Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate goals from real data
  const generateGoals = (): Goal[] => {
    const goals: Goal[] = []
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1))

    // Daily vocabulary goal
    const dailyVocabTarget = preferences?.dailyGoalWords || 5
    const todayVocab = vocabStats?.newWords || 0 // Assuming this is today's count
    goals.push({
      id: '1',
      title: 'Daily Vocabulary',
      description: `Learn ${dailyVocabTarget} new words today`,
      target: dailyVocabTarget,
      current: Math.min(todayVocab, dailyVocabTarget),
      unit: 'words',
      deadline: new Date().toISOString().split('T')[0],
      category: 'daily',
      status: todayVocab >= dailyVocabTarget ? 'completed' : 'active',
      priority: 'high',
    })

    // Weekly translation goal
    const weeklyTranslationTarget = preferences?.weeklyGoalTranslations || 50
    const weeklyTranslations = (history || []).filter((item: any) => {
      const itemDate = new Date(item.createdAt)
      return itemDate >= startOfWeek
    }).length
    goals.push({
      id: '2',
      title: 'Weekly Translation Goal',
      description: `Complete ${weeklyTranslationTarget} translations this week`,
      target: weeklyTranslationTarget,
      current: Math.min(weeklyTranslations, weeklyTranslationTarget),
      unit: 'translations',
      deadline: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      category: 'weekly',
      status: weeklyTranslations >= weeklyTranslationTarget ? 'completed' : 'active',
      priority: 'medium',
    })

    // Study streak goal
    const streakTarget = 30
    const currentStreak = progress?.currentStreak || 0
    goals.push({
      id: '3',
      title: 'Study Streak',
      description: `Maintain a ${streakTarget}-day study streak`,
      target: streakTarget,
      current: Math.min(currentStreak, streakTarget),
      unit: 'days',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'custom',
      status: currentStreak >= streakTarget ? 'completed' : 'active',
      priority: 'medium',
    })

    return goals
  }

  const goals = generateGoals()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily':
        return 'bg-blue-100 text-blue-700'
      case 'weekly':
        return 'bg-green-100 text-green-700'
      case 'monthly':
        return 'bg-purple-100 text-purple-700'
      case 'custom':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-neutral-200 bg-neutral-50'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const completedGoals = goals.filter((goal) => goal.status === 'completed').length
  const activeGoals = goals.filter((goal) => goal.status === 'active').length
  const overallProgress = Math.round(
    goals.reduce((sum, goal) => sum + getProgressPercentage(goal.current, goal.target), 0) /
      goals.length,
  )

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Goals Tracking
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Goals Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-bold text-indigo-600">{activeGoals}</div>
              <div className="text-xs text-neutral-600">Active Goals</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{completedGoals}</div>
              <div className="text-xs text-neutral-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{overallProgress}%</div>
              <div className="text-xs text-neutral-600">Overall Progress</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4" />3
              </div>
              <div className="text-xs text-neutral-600">This Month</div>
            </div>
          </div>

          {/* Goals List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-700">Current Goals</h4>
              <Badge variant="secondary" className="text-xs">
                {activeGoals} active
              </Badge>
            </div>

            <div className="space-y-3">
              {goals.map((goal) => {
                const progressPercentage = getProgressPercentage(goal.current, goal.target)
                const daysRemaining = getDaysRemaining(goal.deadline)
                const isOverdue = daysRemaining < 0
                const isNearDeadline = daysRemaining <= 3 && daysRemaining > 0

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(goal.priority)} ${
                      isOverdue ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Goal Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-neutral-800">{goal.title}</h5>
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                            {goal.priority === 'high' && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600">{goal.description}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {progressPercentage === 100 && (
                            <div className="p-1 bg-green-100 rounded-full">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            {goal.current} / {goal.target} {goal.unit}
                          </span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress
                          value={progressPercentage}
                          className={`h-2 ${progressPercentage === 100 ? 'bg-green-200' : ''}`}
                        />
                      </div>

                      {/* Deadline Info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-neutral-500">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? 'text-red-600'
                              : isNearDeadline
                                ? 'text-yellow-600'
                                : 'text-neutral-500'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>
                            {isOverdue
                              ? `${Math.abs(daysRemaining)} days overdue`
                              : daysRemaining === 0
                                ? 'Due today'
                                : `${daysRemaining} days left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h4 className="text-sm font-medium text-neutral-700">Quick Actions</h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                Set Daily Goal
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Weekly Challenge
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                View Achievements
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Goal Templates
              </Button>
            </div>
          </div>

          {/* Dynamic Motivational Message */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-800">
                  {(() => {
                    const completedGoals = goals.filter((g) => g.progress >= g.target).length
                    const totalGoals = goals.length
                    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

                    if (completionRate >= 80) return 'Excellent Progress!'
                    if (completionRate >= 60) return 'Great Work!'
                    if (completionRate >= 40) return 'Keep Going!'
                    if (completionRate >= 20) return 'Good Start!'
                    return "Let's Begin!"
                  })()}
                </p>
                <p className="text-sm text-indigo-700">
                  {(() => {
                    const completedGoals = goals.filter((g) => g.progress >= g.target).length
                    const totalGoals = goals.length
                    const remainingGoals = totalGoals - completedGoals
                    const currentStreak = progress?.currentStreak || 0

                    if (completedGoals === totalGoals && totalGoals > 0) {
                      return "Amazing! You've completed all your goals. Time to set new challenges!"
                    }

                    if (remainingGoals === 1) {
                      return "You're almost there! Just 1 more goal to complete."
                    }

                    if (remainingGoals > 1) {
                      return `Complete ${remainingGoals} more goals to achieve your targets.`
                    }

                    if (currentStreak >= 7) {
                      return `Incredible ${currentStreak}-day streak! You're building an amazing habit.`
                    }

                    if (currentStreak >= 3) {
                      return `Great ${currentStreak}-day streak! Keep the momentum going.`
                    }

                    return 'Set your first goal and start your learning journey!'
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
