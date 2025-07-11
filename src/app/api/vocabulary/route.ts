import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleApiError, validateRequest, requireAuth } from '@/lib/api/error-handler'
import {
  VocabularyCreateSchema,
  VocabularyQuerySchema,
  VocabularyUpdateSchema,
} from '@/lib/api/validation'
import { getAuthTokenFromCookies, getCustomerFromCookies } from '@/lib/server-cookies'

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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateRequest(VocabularyCreateSchema, {
      ...body,
      customer: customer.id,
    })

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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)

    // Handle different sort parameter formats
    let sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Handle Payload CMS style sort parameter (e.g., "sort=lastPracticed,accuracy")
    const sortParam = searchParams.get('sort')
    if (sortParam && !sortBy) {
      const sortFields = sortParam.split(',')
      sortBy = sortFields[0] // Use first field as primary sort
    }

    const queryParams: any = {
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

    const validatedQuery = validateRequest(VocabularyQuerySchema, queryParams)

    const payload = await getPayload({ config })

    // Build query conditions
    const where: any = {
      customer: {
        equals: customer.id,
      },
    }

    if ((validatedQuery as any).status) {
      where.status = { equals: (validatedQuery as any).status }
    }

    if ((validatedQuery as any).difficulty) {
      where.difficulty = { equals: (validatedQuery as any).difficulty }
    }

    if ((validatedQuery as any).search) {
      where.or = [
        { word: { contains: (validatedQuery as any).search } },
        { translation: { contains: (validatedQuery as any).search } },
        { definition: { contains: (validatedQuery as any).search } },
      ]
    }

    // Get vocabulary with proper access control
    const vocabularyResult = await payload.find({
      collection: 'vocabulary',
      where,
      limit: (validatedQuery as any).limit || 20,
      page: (validatedQuery as any).page || 1,
      sort: `${(validatedQuery as any).sortOrder === 'asc' ? '' : '-'}${(validatedQuery as any).sortBy || 'createdAt'}`,
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

    const validatedData = validateRequest(VocabularyUpdateSchema, {
      ...updateData,
      id,
      customer: customer.id,
    })

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
