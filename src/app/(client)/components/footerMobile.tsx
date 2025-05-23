'use client'

import { validateSession } from '@/app/actions/session'
import {
  Heart,
  Home,
  MenuSquare,
  UserCircle2,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/hooks/zustandStore'

const FooterMobile = () => {
  const [show, setShow] = useState(true)
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const { items } = useCartStore()

  // Pages where footer should be hidden
  const hiddenOnPages = [
    '/login',
    '/daftar',
    '/keranjang/pembayaran',
    '/checkout',
    '/success',
    '/admin',
    '/dashboard',
  ]

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

  const shouldHideFooter =
    hiddenOnPages.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) ||
    (pathname.includes('/kategori/') && pathname.split('/').length > 3)

  const userId = user?.id?.toLowerCase()

  // Pindahkan return null ke sini
  if (shouldHideFooter) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 lg:hidden left-0 right-0 bg-white border-t border-gray-200 shadow-md transition-transform duration-300 z-40 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}>
      <div className='container px-4 py-3 mx-auto'>
        <div className='flex items-center justify-between'>
          <Link
            href='/'
            className={`flex flex-col items-center gap-1 ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            <Home size={20} />
            <p className='text-xs font-medium'>Home</p>
          </Link>

          <Link
            href='/menu'
            className={`flex flex-col items-center gap-1 ${
              pathname === '/menu' || pathname.startsWith('/kategori')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}>
            <MenuSquare size={20} />
            <p className='text-xs font-medium'>Kategori</p>
          </Link>

          <Link
            href='/wishlist'
            className={`flex flex-col items-center gap-1 ${
              pathname === '/wishlist' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            <Heart size={20} />
            <p className='text-xs font-medium'>Wishlist</p>
          </Link>

          <Link
            href={{
              pathname: '/profile',
              query: {
                user: userId,
              },
            }}
            className={`flex flex-col items-center gap-1 ${
              pathname === '/profile' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            <UserCircle2 size={20} />
            <p className='text-xs font-medium'>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FooterMobile
