import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })
    
    const result = await payload.findByID({
      collection: 'practice-sessions',
      id: params.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching practice session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch practice session' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const result = await payload.update({
      collection: 'practice-sessions',
      id: params.id,
      data: body,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating practice session:', error)
    return NextResponse.json(
      { error: 'Failed to update practice session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })

    await payload.delete({
      collection: 'practice-sessions',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting practice session:', error)
    return NextResponse.json(
      { error: 'Failed to delete practice session' },
      { status: 500 }
    )
  }
}
