import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getUsers() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  if (!sessionToken) return []
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  })
  if (!session || session.expires < new Date()) return null
  return session.user
}
