import { usePathname } from 'next/navigation'
import FooterMobileServer from './footerMobileClient'
import { validateSession } from '@/app/actions/session'

const FooterMobile = async () => {
  const session = await validateSession()
  const userId = session?.user?.profile?.id?.toLowerCase()

  return <FooterMobileServer userId={userId} />
}

export default FooterMobile
