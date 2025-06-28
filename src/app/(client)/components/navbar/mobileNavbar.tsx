'use client'
import React, { useState, useEffect } from 'react'
import { Bell, Search, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getCartItems } from '@/app/actions/cartAction'
import { getNotifications } from '@/app/actions/notificationAction'

interface MobileNavbarProps {
  userId?: string
}

const MobileNavbar = ({ userId }: MobileNavbarProps) => {
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: cartData } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await getCartItems()
      return response.success ? response.data || [] : []
    },
    enabled: !!userId,
    // staleTime: 2 * 60 * 1000, // 2 minutes - cart doesn't change that often
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Only refetch when component mounts
  })

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await getNotifications(userId)
      return response.data || []
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - only refetch when admin updates
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Only refetch when component mounts
    // NO refetchInterval - only update when admin triggers invalidation
  })

  const items = cartData || []
  const uniqueProductCount = items.length
  const unreadNotifications =
    notificationsData?.filter((n) => !n.isRead).length || 0

  return (
    <div className='lg:hidden'>
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
              className='size-10 flex items-center justify-center relative'>
              <Bell size={20} className='text-foreground' />
              {mounted && unreadNotifications > 0 && (
                <Badge
                  variant='destructive'
                  className='absolute -top-1 -right-1 h-4 w-6 flex items-center justify-center p-2'>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Badge>
              )}
            </Link>
            {items ? (
              <Link href='/keranjang'>
                <Button size='icon' variant='ghost' className='relative'>
                  <ShoppingCart size={20} className='text-foreground' />
                  {mounted && items.length > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-1 -right-1 h-4 w-6 flex items-center justify-center p-2'>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNavbar
