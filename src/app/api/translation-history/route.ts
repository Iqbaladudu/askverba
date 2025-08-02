import { NextRequest, NextResponse } from 'next/server'
import { translationHistoryAPI } from '@/infrastructure/api/payload'
import { getCurrentUser } from '@/features/auth/actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const mode = searchParams.get('mode')
    const isFavorite = searchParams.get('isFavorite')
    const search = searchParams.get('search')

    const options: any = { limit, page }
    if (mode) options.mode = mode
    if (isFavorite !== null) options.isFavorite = isFavorite === 'true'
    if (search) options.search = search

    const result = await translationHistoryAPI.getByCustomer(customerId, options)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translation-history GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translation history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await translationHistoryAPI.create(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translation-history POST:', error)
    return NextResponse.json(
      { error: 'Failed to create translation history' },
      { status: 500 }
    )
  }
}
