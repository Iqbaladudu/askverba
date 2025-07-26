import { NextRequest, NextResponse } from 'next/server'
import { achievementsAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await achievementsAPI.getAll()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in achievements GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
