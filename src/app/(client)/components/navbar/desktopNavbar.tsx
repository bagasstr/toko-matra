import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NavbarActions } from './navbarActions'
import { CategoryDropdown } from './categoryDropdown'

export const dynamic = 'force-dynamic'

interface DesktopNavbarProps {
  userId?: string
}

const DesktopNavbar = ({ userId }: DesktopNavbarProps) => {
  return (
    <div className='hidden lg:block'>
      {/* Background with gradient */}
      <div className='h-28 w-full rounded-b-4xl absolute top-0 left-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent' />

      <div className='container mx-auto px-4 lg:px-8 py-4'>
        <div className='flex items-center justify-between gap-4'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2'>
            <div className='relative w-12 h-12 shrink-0'>
              <Image
                src='/assets/Logo.png'
                alt='Logo'
                fill
                className='object-contain'
                priority
              />
            </div>
            <span className='text-primary font-bold text-xl'>TOKO MATRA</span>
          </Link>

          {/* Navigation Links */}
          <nav className='hidden lg:flex items-center gap-8'>
            <Link
              href='/'
              className='text-foreground hover:text-primary transition-colors font-medium'>
              Beranda
            </Link>
            <Link
              href='/kategori'
              className='text-foreground hover:text-primary transition-colors font-medium'>
              Kategori
            </Link>
          </nav>

          {/* Navbar Actions (Search, Cart, etc) */}
          <NavbarActions userId={userId} />
        </div>
      </div>
    </div>
  )
}

export default DesktopNavbar
