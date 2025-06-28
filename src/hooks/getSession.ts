import { useEffect, useState } from 'react'
import { useSessionStore } from './zustandStore'
import { validateSession } from '@/app/actions/session'

export const useSession = () => {
  const { setSession } = useSessionStore()

  useEffect(() => {
    const get = async () => {
      const session = await validateSession()
      if (session?.user?.id) {
        setSession(true, session.user.id)
      } else {
        setSession(false, null)
      }
    }
    get()
  }, [setSession])
}
