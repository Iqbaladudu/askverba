import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get all vocabulary for this customer (bypass access control for debugging)
    const vocabularyResult = await payload.find({
      collection: 'vocabulary',
      where: {
        customer: {
          equals: customerId,
        },
      },
      limit: 100,
      overrideAccess: true, // Bypass access control for debugging
    })

    // Get all customers to verify customer exists
    const customerResult = await payload.findByID({
      collection: 'customers',
      id: customerId,
      overrideAccess: true, // Bypass access control for debugging
    })

    // Also get all vocabulary without customer filter to see total count
    const allVocabularyResult = await payload.find({
      collection: 'vocabulary',
      limit: 100,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      customer: customerResult,
      vocabulary: {
        count: vocabularyResult.totalDocs,
        docs: vocabularyResult.docs,
      },
      allVocabulary: {
        count: allVocabularyResult.totalDocs,
        docs: allVocabularyResult.docs,
      },
      debug: {
        customerId,
        query: {
          customer: {
            equals: customerId,
          },
        },
      },
    })
  } catch (error) {
    console.error('Debug vocabulary error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch debug data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
