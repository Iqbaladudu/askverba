/**
 * Translation API route with Next.js best practices
 * Handles both simple and detailed translations with proper validation and caching
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest, requireAuth } from '@/infrastructure/api/error-handler'
import { TranslationRequestSchema } from '@/infrastructure/api/validation'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'
import { translateWithCache } from '@/features/translation'

/**
 * Translate text with caching and history saving
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Get authentication (optional for translation)
    const token = await getAuthTokenFromCookies()
    const customer = await getCustomerFromCookies()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateRequest(TranslationRequestSchema, body)

    // Use customer ID if authenticated and saveToHistory is requested
    let userId = (validatedData as any).userId
    if (!userId && (validatedData as any).saveToHistory && customer?.id) {
      userId = customer.id
    }

    // Require authentication if saving to history
    if ((validatedData as any).saveToHistory) {
      requireAuth(token)
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required to save translation history' },
          { status: 401 },
        )
      }
    }

    // Perform translation with caching
    const response = await translateWithCache({
      text: (validatedData as any).text,
      mode: (validatedData as any).mode,
      userId,
      saveToHistory: (validatedData as any).saveToHistory,
    })

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        result: response.result,
        fromCache: response.fromCache,
        processingTime: response.processingTime,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        totalProcessingTime: processingTime,
        mode: (validatedData as any).mode,
        cached: response.fromCache,
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Get translation history for authenticated user
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const mode = searchParams.get('mode') as 'simple' | 'detailed' | undefined
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Import translation history service
    const { getTranslationHistory } = await import(
      '@/features/translation/services/translationService'
    )

    // Get translation history
    const history = await getTranslationHistory(customer.id, {
      page,
      limit,
      mode,
      search,
      dateFrom,
      dateTo,
    })

    return NextResponse.json({
      success: true,
      data: history,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        query: {
          page,
          limit,
          mode,
          search,
          dateFrom,
          dateTo,
        },
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}

/**
 * Delete translation from history
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

    // Get translation ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Translation ID is required' }, { status: 400 })
    }

    // Import translation service
    const { deleteTranslationHistory } = await import(
      '@/features/translation/services/translationService'
    )

    // Delete translation history entry
    await deleteTranslationHistory(id, customer.id)

    return NextResponse.json({
      success: true,
      message: 'Translation deleted successfully',
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}
