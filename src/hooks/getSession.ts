import { useEffect, useState } from 'react'
import { useAuthStore } from './zustandStore'
import { validateSession } from '@/app/actions/session'

export const useSession = () => {
  const { login } = useAuthStore()
  useEffect(() => {
    const get = async () => {
      const session = await validateSession()
      if (session) {
        login(session)
      }
    }
    get()
  }, [])
}
