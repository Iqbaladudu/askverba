'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Plus,
  Edit,
  Check,
  Clock,
  Calendar,
  Trophy,
  Star,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useTranslationHistory,
  useVocabulary,
  useUserProgress,
  useLearningGoals,
} from '@/hooks/usePayloadData'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function GoalsTracking() {
  const { customer } = useAuth()
  const { history, loading: historyLoading } = useTranslationHistory()
  const { stats: vocabStats, loading: vocabLoading } = useVocabulary()
  const { progress, loading: progressLoading } = useUserProgress()
  const {
    goals: dbGoals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
  } = useLearningGoals()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    target: 1,
    unit: 'words' as 'words' | 'translations' | 'minutes' | 'days' | 'sessions',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  const loading = historyLoading || vocabLoading || progressLoading || goalsLoading

  // Auto-create default goals if user has none
  useEffect(() => {
    if (dbGoals && dbGoals.length === 0 && !goalsLoading && customer?.id) {
      const createDefaults = async () => {
        try {
          // Create default goals via API
          const defaultGoals = [
            {
              title: 'Daily Vocabulary Goal',
              description: 'Learn 5 new words every day to build your vocabulary',
              category: 'daily',
              target: 5,
              unit: 'words',
              deadline: new Date().toISOString().split('T')[0],
              priority: 'high',
            },
            {
              title: 'Weekly Translation Practice',
              description: 'Complete 20 translations this week to improve your skills',
              category: 'weekly',
              target: 20,
              unit: 'translations',
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              priority: 'medium',
            },
            {
              title: 'Monthly Learning Streak',
              description: 'Maintain a 15-day learning streak this month',
              category: 'monthly',
              target: 15,
              unit: 'days',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              priority: 'medium',
            },
          ]

          for (const goalData of defaultGoals) {
            try {
              await createGoal(goalData)
            } catch (error) {
              console.error('Failed to create default goal:', goalData.title, error)
            }
          }
        } catch (error) {
          console.error('Failed to create default goals:', error)
        }
      }
      createDefaults()
    }
  }, [dbGoals, goalsLoading, customer?.id, createGoal])

  // Auto-update goal progress based on real data
  useEffect(() => {
    if (!dbGoals || !history || !vocabStats || !progress) return

    const updateGoalProgressAutomatically = async () => {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      for (const goal of dbGoals) {
        let newProgress = goal.current || 0

        // Calculate progress based on goal category and unit
        switch (goal.unit) {
          case 'words':
            if (goal.category === 'daily') {
              // Count vocabulary added today
              const todayVocab = vocabStats?.newWords || 0
              newProgress = todayVocab
            } else if (goal.category === 'weekly') {
              // Count vocabulary added this week
              const weeklyVocab = (history || [])
                .filter((item: any) => {
                  const itemDate = new Date(item.createdAt)
                  return itemDate >= startOfWeek && item.vocabularyExtracted?.length > 0
                })
                .reduce(
                  (sum: number, item: any) => sum + (item.vocabularyExtracted?.length || 0),
                  0,
                )
              newProgress = weeklyVocab
            }
            break

          case 'translations':
            if (goal.category === 'daily') {
              // Count translations today
              const todayTranslations = (history || []).filter((item: any) => {
                const itemDate = new Date(item.createdAt)
                return itemDate.toDateString() === today.toDateString()
              }).length
              newProgress = todayTranslations
            } else if (goal.category === 'weekly') {
              // Count translations this week
              const weeklyTranslations = (history || []).filter((item: any) => {
                const itemDate = new Date(item.createdAt)
                return itemDate >= startOfWeek
              }).length
              newProgress = weeklyTranslations
            } else if (goal.category === 'monthly') {
              // Count translations this month
              const monthlyTranslations = (history || []).filter((item: any) => {
                const itemDate = new Date(item.createdAt)
                return itemDate >= startOfMonth
              }).length
              newProgress = monthlyTranslations
            }
            break

          case 'days':
            // For streak goals
            newProgress = progress?.currentStreak || 0
            break

          case 'sessions':
            // Count practice sessions
            if (goal.category === 'weekly') {
              newProgress = progress?.weeklyPracticeSessions || 0
            } else if (goal.category === 'monthly') {
              newProgress = progress?.monthlyPracticeSessions || 0
            }
            break
        }

        // Update if progress has changed
        if (newProgress !== goal.current && newProgress >= 0) {
          try {
            await updateGoalProgress(goal.id, newProgress)
          } catch (error) {
            console.error('Failed to update goal progress:', error)
          }
        }
      }
    }

    updateGoalProgressAutomatically()
  }, [dbGoals, history, vocabStats, progress, updateGoalProgress])

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

  // Use real database goals
  const goals = dbGoals || []

  // Handle create goal
  const handleCreateGoal = async (goalData: {
    title: string
    description?: string
    category: 'daily' | 'weekly' | 'monthly' | 'custom'
    target: number
    unit: 'words' | 'translations' | 'minutes' | 'days' | 'sessions'
    deadline: string
    priority?: 'low' | 'medium' | 'high'
  }) => {
    try {
      await createGoal(goalData)
      setShowCreateForm(false) // Close the dialog
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'daily',
        target: 1,
        unit: 'words',
        deadline: '',
        priority: 'medium',
      })
      toast.success('Goal created successfully!')
    } catch (_error) {
      toast.error('Failed to create goal')
    }
  }

  // Handle edit goal
  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || 'daily',
      target: goal.target || 1,
      unit: goal.unit || 'words',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      priority: goal.priority || 'medium',
    })
    setShowEditForm(true)
  }

  // Handle update goal
  const handleUpdateGoal = async (goalData: {
    title: string
    description?: string
    category: 'daily' | 'weekly' | 'monthly' | 'custom'
    target: number
    unit: 'words' | 'translations' | 'minutes' | 'days' | 'sessions'
    deadline: string
    priority?: 'low' | 'medium' | 'high'
  }) => {
    if (!editingGoal) return

    try {
      await updateGoal(editingGoal.id, goalData)
      setShowEditForm(false)
      setEditingGoal(null)
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'daily',
        target: 1,
        unit: 'words',
        deadline: '',
        priority: 'medium',
      })
      toast.success('Goal updated successfully!')
    } catch (_error) {
      toast.error('Failed to update goal')
    }
  }

  // Handle delete goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      toast.success('Goal deleted successfully!')
    } catch (_error) {
      toast.error('Failed to delete goal')
    }
  }

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
  const overallProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (sum, goal) => sum + getProgressPercentage(goal.current || 0, goal.target),
            0,
          ) / goals.length,
        )
      : 0

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Goals Tracking
          </CardTitle>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new learning goal to track your progress and stay motivated.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateGoal(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter goal title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter goal description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Unit</label>
                    <Select
                      value={formData.unit}
                      onValueChange={(
                        value: 'words' | 'translations' | 'minutes' | 'days' | 'sessions',
                      ) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="words">Words</SelectItem>
                        <SelectItem value="translations">Translations</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Target</label>
                    <Input
                      type="number"
                      value={formData.target}
                      onChange={(e) =>
                        setFormData({ ...formData, target: parseInt(e.target.value) || 1 })
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Goal Dialog */}
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Goal</DialogTitle>
                <DialogDescription>
                  Update your learning goal details and track your progress.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateGoal(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter goal title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter goal description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Unit</label>
                    <Select
                      value={formData.unit}
                      onValueChange={(
                        value: 'words' | 'translations' | 'minutes' | 'days' | 'sessions',
                      ) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="words">Words</SelectItem>
                        <SelectItem value="translations">Translations</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Target</label>
                    <Input
                      type="number"
                      value={formData.target}
                      onChange={(e) =>
                        setFormData({ ...formData, target: parseInt(e.target.value) || 1 })
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Update Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingGoal(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500 mb-4">No goals set yet</p>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </DialogTrigger>
                </div>
              ) : (
                goals.map((goal) => {
                  const progressPercentage = getProgressPercentage(goal.current || 0, goal.target)
                  const daysRemaining = getDaysRemaining(goal.deadline)
                  const isOverdue = daysRemaining < 0
                  const isNearDeadline = daysRemaining <= 3 && daysRemaining > 0

                  return (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-lg border-2 ${getPriorityColor(goal.priority || 'medium')} ${
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
                            <p className="text-sm text-neutral-600">
                              {goal.description || 'No description'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit Goal
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete Goal
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &ldquo;{goal.title}&rdquo;?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                              {goal.current || 0} / {goal.target} {goal.unit}
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
                })
              )}
            </div>
          </div>
          Quick Actions
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
                    const completedGoalsCount = goals.filter((g) => g.status === 'completed').length
                    const totalGoals = goals.length
                    const completionRate =
                      totalGoals > 0 ? (completedGoalsCount / totalGoals) * 100 : 0

                    if (completionRate >= 80) return 'Excellent Progress!'
                    if (completionRate >= 60) return 'Great Work!'
                    if (completionRate >= 40) return 'Keep Going!'
                    if (completionRate >= 20) return 'Good Start!'
                    return "Let's Begin!"
                  })()}
                </p>
                <p className="text-sm text-indigo-700">
                  {(() => {
                    const completedGoalsCount = goals.filter((g) => g.status === 'completed').length
                    const totalGoals = goals.length
                    const remainingGoals = totalGoals - completedGoalsCount
                    const currentStreak = progress?.currentStreak || 0

                    if (completedGoalsCount === totalGoals && totalGoals > 0) {
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
