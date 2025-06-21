import { validateSession } from '@/app/actions/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await validateSession()
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Extract only the necessary user data
    const { user } = session
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile
        ? {
            id: user.profile.id,
            fullName: user.profile.fullName,
            phoneNumber: user.profile.phoneNumber,
          }
        : null,
      typeUser: user.typeUser,
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error in user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
