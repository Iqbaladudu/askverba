import { NextRequest, NextResponse } from 'next/server'
import { achievementsAPI } from '@/lib/api/payload'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || user.id

    const result = await achievementsAPI.getUserAchievements(customerId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-achievements GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user achievements' },
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
    const { customerId, achievementId, progress } = body
    
    const result = await achievementsAPI.unlockAchievement(customerId, achievementId, progress)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user-achievements POST:', error)
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    )
  }
}
