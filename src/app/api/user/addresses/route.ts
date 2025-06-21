import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/app/actions/session'

export async function GET() {
  try {
    const session = await validateSession()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const addresses = await prisma.address.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    })

    // Convert any Decimal values to regular numbers
    const formattedAddresses = addresses.map((address) => {
      return {
        ...address,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: formattedAddresses,
    })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve addresses' },
      { status: 500 }
    )
  }
}
