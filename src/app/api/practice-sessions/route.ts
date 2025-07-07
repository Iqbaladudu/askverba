import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const where = searchParams.get('where[customer][equals]')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const sessionType = searchParams.get('where[sessionType][equals]')
    const sort = searchParams.get('sort') || '-createdAt'

    // Build where clause
    const whereClause: any = {}
    if (where) {
      whereClause.customer = { equals: where }
    }
    if (sessionType) {
      whereClause.sessionType = { equals: sessionType }
    }

    const result = await payload.find({
      collection: 'practice-sessions',
      where: whereClause,
      limit,
      page,
      sort: [sort],
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching practice sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch practice sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const result = await payload.create({
      collection: 'practice-sessions',
      data: body,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating practice session:', error)
    return NextResponse.json(
      { error: 'Failed to create practice session' },
      { status: 500 }
    )
  }
}
