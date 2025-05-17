'use server'

import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { ZodError, type z } from 'zod'
import { createSession, validateSession } from './session'
import { revalidatePath } from 'next/cache'

export const login = async (formData: FormData) => {
  try {
    // console.log('formData', formData)

    const data = Object.fromEntries(formData)
    const parseData = loginSchema.safeParse(data)
    if (!parseData.success) {
      return { error: 'silahkan masukan email dan password' }
    }
    const { email, password } = parseData.data

    const existsUser = await prisma.user.findUnique({
      where: { email },
    })

    // console.log('existsUser', existsUser)

    if (email !== existsUser?.email) {
      return { error: 'Email tidak terdaftar' }
    }

    const hashPswd = await bcrypt.compare(password, existsUser?.password || '')
    if (!hashPswd) {
      return { error: 'Password salah' }
    }
    await createSession(existsUser.id)

    return { success: true }
  } catch (error: any) {
    return {
      error: error.message,
    }
  }
}
