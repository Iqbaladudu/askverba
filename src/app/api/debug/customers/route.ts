import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get all customers
    const customersResult = await payload.find({
      collection: 'customers',
      limit: 100,
      overrideAccess: true
    })

    return NextResponse.json({
      success: true,
      customers: {
        count: customersResult.totalDocs,
        docs: customersResult.docs
      }
    })
  } catch (error) {
    console.error('Debug customers error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
