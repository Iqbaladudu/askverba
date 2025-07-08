/**
 * Practice statistics API route
 * Provides practice performance analytics and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, requireAuth } from '@/lib/api/error-handler'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'
import { getPracticeStats } from '@/lib/services/practiceService'

/**
 * Get practice statistics for authenticated user
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as 'day' | 'week' | 'month' | 'year') || 'week'
    const sessionType = searchParams.get('sessionType') as
      | 'flashcard'
      | 'multiple_choice'
      | 'typing'
      | 'listening'
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard'

    // Get practice statistics
    const stats = await getPracticeStats(customer.id, period)

    // Filter by session type if specified
    const filteredStats = stats
    if (sessionType || difficulty) {
      // This would require additional filtering logic in the service
      // For now, we'll return the basic stats
    }

    return NextResponse.json({
      success: true,
      data: filteredStats,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        period,
        sessionType,
        difficulty,
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}
