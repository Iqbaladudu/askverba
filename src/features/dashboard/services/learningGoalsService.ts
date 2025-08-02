import { getPayload } from 'payload'
import config from '@payload-config'
import { LearningGoal } from '@/payload-types'

export interface LearningGoalCreateData {
  title: string
  description?: string
  category: 'daily' | 'weekly' | 'monthly' | 'custom'
  target: number
  unit: 'words' | 'translations' | 'minutes' | 'days' | 'sessions'
  deadline: string
  priority?: 'low' | 'medium' | 'high'
  customer: string
}

export interface LearningGoalUpdateData {
  title?: string
  description?: string
  category?: 'daily' | 'weekly' | 'monthly' | 'custom'
  target?: number
  current?: number
  unit?: 'words' | 'translations' | 'minutes' | 'days' | 'sessions'
  deadline?: string
  status?: 'active' | 'completed' | 'overdue' | 'paused'
  priority?: 'low' | 'medium' | 'high'
}

export interface LearningGoalsResponse {
  docs: LearningGoal[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Get user learning goals
 */
export async function getUserLearningGoals(
  userId: string,
  options: {
    status?: 'active' | 'completed' | 'overdue' | 'paused'
    category?: 'daily' | 'weekly' | 'monthly' | 'custom'
    limit?: number
    page?: number
  } = {},
): Promise<LearningGoalsResponse> {
  try {
    const payload = await getPayload({ config })
    const { status = 'active', category, limit = 50, page = 1 } = options

    // Build query
    const where: any = {
      customer: {
        equals: userId,
      },
    }

    if (status) {
      where.status = { equals: status }
    }

    if (category) {
      where.category = { equals: category }
    }

    const response = await payload.find({
      collection: 'learning-goals',
      where,
      limit,
      page,
      sort: '-createdAt',
      overrideAccess: true, // Bypass access control for user's own goals
    })

    return {
      docs: response.docs,
      totalDocs: response.totalDocs,
      limit: response.limit,
      page: response.page || 1,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPrevPage: response.hasPrevPage,
    }
  } catch (error) {
    console.error('Failed to get user learning goals:', error)
    throw new Error('Failed to fetch learning goals')
  }
}

/**
 * Create new learning goal
 */
export async function createLearningGoal(
  userId: string,
  data: Omit<LearningGoalCreateData, 'customer'>,
): Promise<LearningGoal> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.create({
      collection: 'learning-goals',
      data: {
        ...data,
        customer: userId,
        current: 0,
        status: 'active',
      },
      overrideAccess: true, // Bypass access control for creation
    })

    return response
  } catch (error) {
    console.error('Failed to create learning goal:', error)
    throw new Error('Failed to create learning goal')
  }
}

/**
 * Update learning goal
 */
export async function updateLearningGoal(
  userId: string,
  goalId: string,
  data: LearningGoalUpdateData,
): Promise<LearningGoal> {
  try {
    const payload = await getPayload({ config })

    // First verify the goal belongs to the user
    const existingGoal = await payload.findByID({
      collection: 'learning-goals',
      id: goalId,
      overrideAccess: true,
    })

    if (
      !existingGoal ||
      (typeof existingGoal.customer === 'string'
        ? existingGoal.customer
        : existingGoal.customer.id) !== userId
    ) {
      throw new Error('Goal not found or access denied')
    }

    const response = await payload.update({
      collection: 'learning-goals',
      id: goalId,
      data,
      overrideAccess: true, // Bypass access control for updates
    })

    return response
  } catch (error) {
    console.error('Failed to update learning goal:', error)
    throw new Error('Failed to update learning goal')
  }
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(
  userId: string,
  goalId: string,
  current: number,
): Promise<LearningGoal> {
  try {
    return await updateLearningGoal(userId, goalId, { current })
  } catch (error) {
    console.error('Failed to update goal progress:', error)
    throw new Error('Failed to update goal progress')
  }
}

/**
 * Delete learning goal
 */
export async function deleteLearningGoal(userId: string, goalId: string): Promise<void> {
  try {
    const payload = await getPayload({ config })

    // First verify the goal belongs to the user
    const existingGoal = await payload.findByID({
      collection: 'learning-goals',
      id: goalId,
      overrideAccess: true,
    })

    if (
      !existingGoal ||
      (typeof existingGoal.customer === 'string'
        ? existingGoal.customer
        : existingGoal.customer.id) !== userId
    ) {
      throw new Error('Goal not found or access denied')
    }

    await payload.delete({
      collection: 'learning-goals',
      id: goalId,
      overrideAccess: true, // Bypass access control for deletes
    })
  } catch (error) {
    console.error('Failed to delete learning goal:', error)
    throw new Error('Failed to delete learning goal')
  }
}

/**
 * Get learning goals statistics
 */
export async function getLearningGoalsStats(userId: string): Promise<{
  total: number
  active: number
  completed: number
  overdue: number
  completionRate: number
}> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'learning-goals',
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: 1000, // Get all for stats calculation
      overrideAccess: true,
    })

    const goals = response.docs
    const total = goals.length
    const active = goals.filter((g) => g.status === 'active').length
    const completed = goals.filter((g) => g.status === 'completed').length
    const overdue = goals.filter((g) => g.status === 'overdue').length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      active,
      completed,
      overdue,
      completionRate,
    }
  } catch (error) {
    console.error('Failed to get learning goals stats:', error)
    throw new Error('Failed to fetch learning goals statistics')
  }
}

/**
 * Auto-update goal statuses based on deadlines and progress
 */
export async function updateGoalStatuses(userId: string): Promise<void> {
  try {
    const payload = await getPayload({ config })
    const today = new Date()

    // Get all active goals for the user
    const response = await payload.find({
      collection: 'learning-goals',
      where: {
        customer: {
          equals: userId,
        },
        status: {
          equals: 'active',
        },
      },
      limit: 1000,
      overrideAccess: true,
    })

    for (const goal of response.docs) {
      const deadline = new Date(goal.deadline)
      const progress = ((goal.current || 0) / goal.target) * 100

      let newStatus = goal.status

      // Check if goal is completed
      if (progress >= 100 && goal.status !== 'completed') {
        newStatus = 'completed'
      }
      // Check if goal is overdue
      else if (deadline < today && goal.status === 'active') {
        newStatus = 'overdue'
      }

      // Update status if changed
      if (newStatus !== goal.status) {
        await payload.update({
          collection: 'learning-goals',
          id: goal.id,
          data: {
            status: newStatus,
            ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          },
          overrideAccess: true,
        })
      }
    }
  } catch (error) {
    console.error('Failed to update goal statuses:', error)
    // Don't throw error here to avoid breaking other functionality
  }
}

/**
 * Create default goals for new users
 */
export async function createDefaultGoals(userId: string): Promise<LearningGoal[]> {
  try {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const defaultGoals = [
      {
        title: 'Daily Vocabulary Goal',
        description: 'Learn 5 new words every day to build your vocabulary',
        category: 'daily' as const,
        target: 5,
        unit: 'words' as const,
        deadline: today.toISOString().split('T')[0],
        priority: 'high' as const,
      },
      {
        title: 'Weekly Translation Practice',
        description: 'Complete 20 translations this week to improve your skills',
        category: 'weekly' as const,
        target: 20,
        unit: 'translations' as const,
        deadline: nextWeek.toISOString().split('T')[0],
        priority: 'medium' as const,
      },
      {
        title: 'Monthly Learning Streak',
        description: 'Maintain a 15-day learning streak this month',
        category: 'monthly' as const,
        target: 15,
        unit: 'days' as const,
        deadline: nextMonth.toISOString().split('T')[0],
        priority: 'medium' as const,
      },
    ]

    const createdGoals: LearningGoal[] = []

    for (const goalData of defaultGoals) {
      try {
        const goal = await createLearningGoal(userId, goalData)
        createdGoals.push(goal)
      } catch (error) {
        console.error('Failed to create default goal:', goalData.title, error)
      }
    }

    return createdGoals
  } catch (error) {
    console.error('Failed to create default goals:', error)
    throw new Error('Failed to create default goals')
  }
}

/**
 * Check if user has any goals and create defaults if needed
 */
export async function ensureUserHasGoals(userId: string): Promise<void> {
  try {
    const response = await getUserLearningGoals(userId, { limit: 1 })

    // If user has no goals, create default ones
    if (response.totalDocs === 0) {
      await createDefaultGoals(userId)
    }
  } catch (error) {
    console.error('Failed to ensure user has goals:', error)
    // Don't throw error here to avoid breaking other functionality
  }
}
