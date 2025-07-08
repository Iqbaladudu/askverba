/**
 * Practice sessions API route with Next.js best practices
 * Handles practice session CRUD operations with proper validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest, requireAuth } from '@/lib/api/error-handler'
import { PracticeSessionCreateSchema, PracticeSessionQuerySchema } from '@/lib/api/validation'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'
import { 
  createPracticeSession,
  getUserPracticeSessions,
  getPracticeStats
} from '@/lib/services/practiceService'

/**
 * Create new practice session
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()
    
    requireAuth(token)
    
    if (!customer?.id) {
      return NextResponse.json(
        { error: 'Customer information required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateRequest(PracticeSessionCreateSchema, {
      ...body,
      customer: customer.id,
    })

    // Create practice session
    const session = await createPracticeSession(customer.id, validatedData as any)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: session,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        sessionId: session.id,
      }
    })

  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Get user practice sessions with filtering
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    // Get authentication
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()
    
    requireAuth(token)
    
    if (!customer?.id) {
      return NextResponse.json(
        { error: 'Customer information required' },
        { status: 401 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      customerId: customer.id,
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sessionType: searchParams.get('sessionType'),
      difficulty: searchParams.get('difficulty'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }

    const validatedQuery = validateRequest(PracticeSessionQuerySchema, queryParams)

    // Get practice sessions
    const sessions = await getUserPracticeSessions(customer.id, validatedQuery as any)

    return NextResponse.json({
      success: true,
      data: sessions,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        query: validatedQuery,
      }
    })

  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}
