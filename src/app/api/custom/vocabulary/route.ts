import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { handleApiError, validateRequest, requireAuth } from '@/lib/api/error-handler'
import {
  VocabularyCreateSchema,
  VocabularyQuerySchema,
  VocabularyUpdateSchema,
} from '@/lib/api/validation'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'
import { z } from 'zod'

/**
 * Custom Vocabulary API - Moved to /api/custom/vocabulary to avoid conflicts
 *
 * This endpoint provides custom vocabulary operations for the frontend application.
 * Payload's built-in REST API is available at /api/vocabulary for admin panel use.
 *
 * This separation ensures:
 * - Admin panel can use Payload's native REST API without conflicts
 * - Frontend gets custom business logic and validation
 * - No interference between admin and frontend operations
 */

/**
 * Create new vocabulary entry
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

    // Debug request details
    console.log('POST /api/custom/vocabulary request details:', {
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    })

    // Parse and validate request body with error handling
    let body
    try {
      const contentType = request.headers.get('content-type') || ''
      const rawBody = await request.text()

      console.log('Request details:', {
        contentType,
        bodyLength: rawBody.length,
        bodyPreview: rawBody.substring(0, 200),
        method: request.method,
        url: request.url,
        httpMethodOverride: request.headers.get('x-http-method-override'),
        referer: request.headers.get('referer'),
        isFromAdmin: request.headers.get('referer')?.includes('/admin/'),
      })

      // Handle different content types
      if (contentType.includes('application/json')) {
        // Check if body is empty
        if (!rawBody.trim()) {
          console.error('Empty request body')
          return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
        }
        body = JSON.parse(rawBody)
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // This is likely from Payload admin panel - convert to GET request behavior
        const searchParams = new URLSearchParams(rawBody)

        // Check if this is actually a GET request disguised as POST (Payload admin does this)
        const httpMethodOverride = request.headers.get('x-http-method-override')
        if (httpMethodOverride === 'GET') {
          // Redirect to GET handler
          const url = new URL(request.url)
          for (const [key, value] of searchParams.entries()) {
            url.searchParams.set(key, value)
          }

          // Create a new request object for GET handling
          const getRequest = new NextRequest(url.toString(), {
            method: 'GET',
            headers: request.headers,
          })

          return GET(getRequest)
        }

        // If it's a real POST with form data, reject it
        return NextResponse.json(
          {
            error: 'POST requests must use application/json content type',
            received: contentType,
            hint: 'Use GET for querying vocabulary data',
          },
          { status: 400 },
        )
      } else {
        console.error('Invalid content type:', contentType)
        console.error('Request appears to be from:', {
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          origin: request.headers.get('origin'),
        })
        return NextResponse.json(
          {
            error: 'Invalid content type. Expected application/json',
            received: contentType,
            bodyPreview: rawBody.substring(0, 100),
          },
          { status: 400 },
        )
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        },
        { status: 400 },
      )
    }

    const validatedData = validateRequest<z.infer<typeof VocabularyCreateSchema>>(
      VocabularyCreateSchema,
      {
        ...body,
        customer: customer.id,
      },
    )

    const payload = await getPayload({ config })

    // Create vocabulary entry with proper access control
    const vocabularyEntry = await payload.create({
      collection: 'vocabulary',
      data: validatedData,
      user: customer, // Use proper user context instead of overrideAccess
    })

    return NextResponse.json({
      success: true,
      data: vocabularyEntry,
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
 * Get user vocabulary with filtering and pagination
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

    // Parse query parameters (bukan body)
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const queryParams: Record<string, string> = {
      customerId: customer.id,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy,
      sortOrder,
    }

    // Only include optional parameters if they exist and are not null
    const status = searchParams.get('status')
    if (status) queryParams.status = status

    const difficulty = searchParams.get('difficulty')
    if (difficulty) queryParams.difficulty = difficulty

    const search = searchParams.get('search')
    if (search) queryParams.search = search

    const validatedQuery = validateRequest<z.infer<typeof VocabularyQuerySchema>>(
      VocabularyQuerySchema,
      queryParams,
    )

    const payload = await getPayload({ config })

    // Build query conditions
    const where: Where = {
      customer: {
        equals: customer.id,
      },
    }

    if (validatedQuery.status) {
      where.status = { equals: validatedQuery.status }
    }

    if (validatedQuery.difficulty) {
      where.difficulty = { equals: validatedQuery.difficulty }
    }

    if (validatedQuery.search) {
      where.or = [
        { word: { contains: validatedQuery.search } },
        { translation: { contains: validatedQuery.search } },
        { definition: { contains: validatedQuery.search } },
      ]
    }

    // Get vocabulary with proper access control
    const vocabularyResult = await payload.find({
      collection: 'vocabulary',
      where,
      limit: validatedQuery.limit || 20,
      page: validatedQuery.page || 1,
      sort: `${validatedQuery.sortOrder === 'asc' ? '' : '-'}${validatedQuery.sortBy || 'createdAt'}`,
      user: customer, // Use proper user context
    })

    return NextResponse.json({
      success: true,
      data: vocabularyResult,
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
 * Update vocabulary entry
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
      return NextResponse.json({ error: 'Vocabulary ID is required' }, { status: 400 })
    }

    const validatedData = validateRequest<z.infer<typeof VocabularyUpdateSchema>>(
      VocabularyUpdateSchema,
      {
        ...updateData,
        id,
        customer: customer.id,
      },
    )

    const payload = await getPayload({ config })

    // Update vocabulary entry with proper access control
    const updatedEntry = await payload.update({
      collection: 'vocabulary',
      id,
      data: validatedData,
      user: customer,
    })

    return NextResponse.json({
      success: true,
      data: updatedEntry,
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
 * Delete vocabulary entry
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

    // Get vocabulary ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Vocabulary ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Delete vocabulary entry with proper access control
    await payload.delete({
      collection: 'vocabulary',
      id,
      user: customer,
    })

    return NextResponse.json({
      success: true,
      message: 'Vocabulary entry deleted successfully',
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleApiError(error, request.url, requestId)
  }
}
