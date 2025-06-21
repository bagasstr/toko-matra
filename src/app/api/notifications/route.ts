import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/actions/session'
import { getNotifications } from '@/app/actions/notificationAction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate session
    const session = await validateSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notifications for the user
    const result = await getNotifications(userId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      notifications: result.data || [],
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
