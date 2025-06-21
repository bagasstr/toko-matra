import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'
import { validateSession } from '@/app/actions/session'

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

export async function getCurrentUser() {
  const session = await validateSession()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login-admin')
  }

  return user
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login-admin')
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  return user
}
