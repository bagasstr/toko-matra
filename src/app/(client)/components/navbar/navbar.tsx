'use client'
import { Suspense } from 'react'
import MobileNavbar from './mobileNavbar'
import DesktopNavbar from './desktopNavbar'

const Navbar = ({ userId }: { userId?: string }) => (
  <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm'>
    <Suspense fallback={<div>Loading...</div>}>
      <MobileNavbar userId={userId} />
    </Suspense>
    <Suspense fallback={<div>Loading...</div>}>
      <DesktopNavbar userId={userId} />
    </Suspense>
  </header>
)

export default Navbar
