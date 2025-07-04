import { Suspense } from 'react'
import { validateSession } from '../actions/session'
import Navbar from './components/navbar/navbar'
import Footer from './components/footer'
import FooterMobileWrapper from './components/FooterMobileWrapper'

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Validate session with error handling for better performance
  let session = null
  try {
    session = await validateSession()
  } catch (error) {
    // Graceful degradation - continue without session if there's an error
    console.error('Session validation error:', error)
  }
  const userId = session?.user?.id?.toLowerCase()
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Navbar tanpa suspense */}
      <Navbar userId={userId || ''} />

      {/* Main content area dengan optimasi spacing */}
      <main className='flex-1 pt-16 lg:pt-20 pb-20 lg:pb-0'>{children}</main>

      {/* Footer components dengan lazy loading untuk mengurangi initial bundle */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <FooterMobileWrapper />
      </Suspense>
    </div>
  )
}
