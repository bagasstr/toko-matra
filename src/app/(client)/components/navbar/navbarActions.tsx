'use client'

import { Bell, Search, ShoppingCart, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getCartItems } from '@/app/actions/cartAction'
import { useQuery } from '@tanstack/react-query'

interface NavbarActionsProps {
  userId?: string
}

export function NavbarActions({ userId }: NavbarActionsProps) {
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await getCartItems()
      return data || []
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Consider data stale immediately
  })

  const items = cartData || []
  const uniqueProductCount = items.length

  return (
    <>
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
                  variant='default'
                  className='absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0'>
                  {uniqueProductCount}
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
    </>
  )
}
