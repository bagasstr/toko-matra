import { validateSession } from '@/app/actions/session'

export const GET = async () => {
  const getSession = await validateSession()
  return new Response(JSON.stringify(getSession), { status: 200 })
}
