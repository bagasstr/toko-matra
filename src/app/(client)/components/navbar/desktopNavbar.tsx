import React, { useEffect, useState } from 'react'
import { Bell, Search, ShoppingCart, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import { useCartStore } from '@/hooks/zustandStore'
import { Badge } from '@/components/ui/badge'
import { getCartItems } from '@/app/actions/cartAction'
import { useQuery } from '@tanstack/react-query'

export const dynamic = 'force-dynamic'

const DesktopNavbar = async () => {
  const { data: cartData } = await getCartItems()
  const items = cartData || []
  const session = await validateSession()
  const userId = session?.user?.profile.id.toLowerCase()
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
          <nav className='hidden xl:flex items-center gap-8'>
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

          {/* Search Bar */}
          <div className='flex-1 max-w-xl mx-4 xl:mx-8'>
            <div className='relative w-full'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <Search size={20} />
              </span>
              <Input
                type='search'
                placeholder='Cari produk...'
                className='pl-10 pr-4 py-2 h-10 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition bg-background'
              />
            </div>
          </div>

          {/* User Actions */}
          <div className='flex items-center gap-2 xl:gap-4 shrink-0'>
            <Button size='icon' variant='ghost' className=''>
              <Link href='/notifikasi'>
                <Bell size={20} className='text-foreground' />
              </Link>
            </Button>
            {items ? (
              <Link href='/keranjang'>
                <Button size='icon' variant='ghost' className='relative'>
                  <ShoppingCart size={20} className='text-foreground' />
                  {items.length > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0'>
                      {items.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            ) : (
              <Link href='/keranjang'>
                <Button size='icon' variant='ghost' className='relative'>
                  <ShoppingCart size={20} className='text-foreground' />
                </Button>
              </Link>
            )}
            <Button size='icon' variant='ghost' className=''>
              <Link
                href={{
                  pathname: '/profile',
                  query: {
                    user: userId,
                  },
                }}>
                <User size={20} className='text-foreground' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesktopNavbar
