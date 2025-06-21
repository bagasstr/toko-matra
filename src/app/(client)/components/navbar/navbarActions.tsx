'use client'

import { Bell, Search, ShoppingCart, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getCartItems } from '@/app/actions/cartAction'
import { getNotifications } from '@/app/actions/notificationAction'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface NavbarActionsProps {
  userId?: string
}

export function NavbarActions({ userId }: NavbarActionsProps) {
  const queryClient = useQueryClient()
  const [cartBadgeCount, setCartBadgeCount] = useState(0)

  const { data: cartData, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await getCartItems()
      return response.success ? response.data || [] : []
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache the data
  })

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await getNotifications()
      return response.notifications || []
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Poll every 5 seconds for notifications
    staleTime: 0,
    gcTime: 0,
  })

  // Calculate badge count from cart data (converted from total quantity)
  const totalQuantity = (cartData || []).reduce((total, item) => {
    return total + (item?.quantity || 0)
  }, 0)

  // Convert quantity to badge count: 50 = 1, 60 = 2, 70 = 3, etc.
  const calculatedBadgeCount =
    totalQuantity >= 50 ? Math.floor((totalQuantity - 50) / 10) + 1 : 0

  // Calculate unread notifications count
  const unreadNotifications =
    notificationsData?.filter((n) => !n.isRead).length || 0

  // Update badge count whenever cart data changes
  useEffect(() => {
    setCartBadgeCount(calculatedBadgeCount)
  }, [calculatedBadgeCount])

  // Debug logging
  console.log('=== Cart Badge Debug ===')
  console.log('Cart data in navbar:', cartData)
  console.log('Total quantity:', totalQuantity)
  console.log('Calculated badge count:', calculatedBadgeCount)
  console.log('Final badge count:', cartBadgeCount)
  console.log('========================')

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // Validate quantity parameter
    if (
      typeof newQuantity !== 'number' ||
      isNaN(newQuantity) ||
      newQuantity < 0
    ) {
      console.error('Invalid quantity parameter:', newQuantity)
      return
    }

    // Ensure newQuantity is an integer
    const validQuantity = Math.floor(newQuantity)
    if (validQuantity !== newQuantity) {
      console.error('Quantity must be an integer:', newQuantity)
      return
    }

    console.log(`Updating quantity for item ${itemId} to ${validQuantity}`)
    // ... rest of the function
  }

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
        <Link href='/notifikasi'>
          <Button size='icon' variant='ghost' className='relative'>
            <Bell size={20} className='text-foreground' />
            {unreadNotifications > 0 && (
              <Badge
                variant='destructive'
                className='absolute -top-1 -right-1 h-4 w-6 flex items-center justify-center p-2'>
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Badge>
            )}
          </Button>
        </Link>
        {cartData ? (
          <Link href='/keranjang'>
            <Button size='icon' variant='ghost' className='relative'>
              <ShoppingCart size={20} className='text-foreground' />
              {cartBadgeCount > 0 && (
                <Badge
                  variant='default'
                  className='absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-1 text-xs'>
                  {cartBadgeCount}
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
