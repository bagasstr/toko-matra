'use client'

import { validateSession } from '@/app/actions/session'
import { Heart, Home, MenuSquare, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const FooterMobile = () => {
  const [show, setShow] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const profileSession = async () => {
      const session = await validateSession()
      if (session) {
        setUser(session?.user?.profile)
      }
    }
    profileSession()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight

      // Jika posisi scroll sudah di paling bawah
      if (scrollY + windowHeight >= docHeight - 2) {
        setShow(false)
      } else {
        setShow(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const userId = user?.id?.toLowerCase()

  return (
    <div
      className={`fixed bottom-0 lg:hidden left-0 right-0 bg-background transition-transform duration-300 z-40 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}>
      <div className='container px-4 py-3 mx-auto'>
        <div className='flex items-center justify-between'>
          <Link href='/' className='flex flex-col items-center gap-1'>
            <Home size={20} />
            <p className='text-sm'>Home</p>
          </Link>
          <Link href='/menu' className='flex flex-col items-center gap-1'>
            <MenuSquare size={20} />
            <p className='text-sm'>Menu</p>
          </Link>
          <Link href='/wishlist' className='flex flex-col items-center gap-1'>
            <Heart size={20} />
            <p className='text-sm'>Wishlist</p>
          </Link>
          <Link
            href={{
              pathname: '/profile',
              query: {
                user: userId,
              },
            }}
            className='flex flex-col items-center gap-1'>
            <UserCircle2 size={20} />
            <p className='text-sm'>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FooterMobile
