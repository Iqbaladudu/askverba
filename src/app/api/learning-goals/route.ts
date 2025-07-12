import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest, requireAuth } from '@/lib/api/error-handler'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'
import {
  getUserLearningGoals,
  createLearningGoal,
  updateLearningGoal,
  deleteLearningGoal,
  updateGoalStatuses,
} from '@/lib/services/learningGoalsService'
import { z } from 'zod'

// Validation schemas
const LearningGoalCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  target: z.number().min(1, 'Target must be positive'),
  unit: z.enum(['words', 'translations', 'minutes', 'days', 'sessions']),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

const LearningGoalUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  target: z.number().min(1, 'Target must be positive').optional(),
  current: z.number().min(0, 'Current must be non-negative').optional(),
  unit: z.enum(['words', 'translations', 'minutes', 'days', 'sessions']).optional(),
  deadline: z.string().min(1, 'Deadline is required').optional(),
  status: z.enum(['active', 'completed', 'overdue', 'paused']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

/**
 * Get learning goals for authenticated user
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()

    requireAuth(token)

    if (!customer?.id) {
      return NextResponse.json({ error: 'Customer information required' }, { status: 401 })
    }

    // Parse query parameters with defaults
    const { searchParams } = new URL(request.url)

    const queryOptions = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      page: parseInt(searchParams.get('page') || '1'),
    }

    // Validate only the values that are present
    const validatedQuery: any = {}
    if (
      queryOptions.status &&
      ['active', 'completed', 'overdue', 'paused'].includes(queryOptions.status)
    ) {
      validatedQuery.status = queryOptions.status
    }
    if (
      queryOptions.category &&
      ['daily', 'weekly', 'monthly', 'custom'].includes(queryOptions.category)
    ) {
      validatedQuery.category = queryOptions.category
    }
    if (queryOptions.limit >= 1 && queryOptions.limit <= 100) {
      validatedQuery.limit = queryOptions.limit
    } else {
      validatedQuery.limit = 50
    }
    if (queryOptions.page >= 1) {
      validatedQuery.page = queryOptions.page
    } else {
      validatedQuery.page = 1
    }

    // Auto-update goal statuses before fetching
    await updateGoalStatuses(customer.id)

    // Get learning goals
    const goalsResult = await getUserLearningGoals(customer.id, validatedQuery)

    return NextResponse.json({
      success: true,
      data: goalsResult,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        query: validatedQuery,
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Create new learning goal
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()

    requireAuth(token)

    if (!customer?.id) {
      return NextResponse.json({ error: 'Customer information required' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateRequest(LearningGoalCreateSchema, body)

    // Create learning goal
    const goal = await createLearningGoal(customer.id, validatedData)

    return NextResponse.json({
      success: true,
      data: goal,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Update learning goal
 */
export async function PUT(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()

    requireAuth(token)

    if (!customer?.id) {
      return NextResponse.json({ error: 'Customer information required' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const validatedData = validateRequest(LearningGoalUpdateSchema, updateData)

    // Update learning goal
    const updatedGoal = await updateLearningGoal(customer.id, id, validatedData)

    return NextResponse.json({
      success: true,
      data: updatedGoal,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Delete learning goal
 */
export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()

    requireAuth(token)

    if (!customer?.id) {
      return NextResponse.json({ error: 'Customer information required' }, { status: 401 })
    }

    // Get goal ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Delete learning goal
    await deleteLearningGoal(customer.id, id)

    return NextResponse.json({
      success: true,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}
