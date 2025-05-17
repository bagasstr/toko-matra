import React from 'react'
import { Bell, Search, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getCartItems } from '@/app/actions/cartAction'

export const dynamic = 'force-dynamic'

const MobileNavbar = async () => {
  const { data: cartData } = await getCartItems()
  const items = cartData || []
  return (
    <div className='lg:hidden bg-blue-100'>
      <div className='h-28 w-full rounded-b-4xl absolute top-0 left-0 -z-10' />
      <div className='container p-4 mx-auto'>
        <div className='flex items-center gap-2 justify-between w-full'>
          <Link href='/' className='relative w-10 h-10'>
            <Image
              src='/assets/Logo.png'
              alt='Logo'
              fill
              className='object-contain'
            />
          </Link>
          <div className='flex-1'>
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
          <div className='flex items-center gap-2'>
            <Link
              href='/notifikasi'
              className='size-10 flex items-center justify-center'>
              <Bell size={20} className='text-foreground' />
            </Link>
            {items ? (
              <Link href='/keranjang'>
                <Button size='icon' variant='ghost' className='relative'>
                  <ShoppingCart size={20} className='text-foreground' />
                  {items.length > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0'>
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNavbar
