import { useEffect } from 'react'
import { validateSession } from '../actions/session'
import { useAuthStore } from '@/hooks/zustandStore'
import Navbar from './components/navbar/navbar'
import FooterMobile from './components/footerMobile'
import Footer from './components/footer'

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <main className='py-4 mt-16 lg:mt-20'>{children}</main>
      <Footer />
    </>
  )
}
