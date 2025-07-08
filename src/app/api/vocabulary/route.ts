import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer,
      word,
      translation,
      definition,
      example,
      difficulty = 'medium',
      status = 'new',
      tags = [],
    } = body

    if (!customer || !word || !translation) {
      return NextResponse.json(
        { error: 'Customer, word, and translation are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Format tags array to match collection schema
    const formattedTags = Array.isArray(tags)
      ? tags.map((tag) => ({ tag: typeof tag === 'string' ? tag : tag.tag || '' }))
      : []

    // Create vocabulary entry
    const vocabularyEntry = await payload.create({
      collection: 'vocabulary',
      data: {
        customer,
        word,
        translation,
        definition: definition || '',
        example: example || '',
        difficulty,
        status,
        practiceCount: 0,
        accuracy: 0,
        tags: formattedTags,
      },
      overrideAccess: true, // Bypass access control for testing
    })

    return NextResponse.json({
      success: true,
      data: vocabularyEntry,
    })
  } catch (error) {
    console.error('Create vocabulary error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create vocabulary entry',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get vocabulary for this customer
    const vocabularyResult = await payload.find({
      collection: 'vocabulary',
      where: {
        customer: {
          equals: customerId,
        },
      },
      limit: 100,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      data: vocabularyResult,
    })
  } catch (error) {
    console.error('Get vocabulary error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
