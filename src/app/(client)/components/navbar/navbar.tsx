'use client'
import MobileNavbar from './mobileNavbar'
import DesktopNavbar from './desktopNavbar'

const Navbar = ({ userId }: { userId?: string }) => (
  <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm'>
    <MobileNavbar userId={userId} />
    <DesktopNavbar userId={userId} />
  </header>
)
export default Navbar
