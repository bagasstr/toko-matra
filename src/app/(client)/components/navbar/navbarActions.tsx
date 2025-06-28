'use client'

import { Bell, Search, ShoppingCart, User, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getCartItems } from '@/app/actions/cartAction'
import { getNotifications } from '@/app/actions/notificationAction'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { useSessionStore } from '@/hooks/zustandStore'

interface NavbarActionsProps {
  userId?: string
}

export function NavbarActions({ userId }: NavbarActionsProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isLoggedIn } = useSessionStore()

  // Debounce search query untuk performance dengan delay lebih lama
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await getCartItems()
      return response.success ? response.data || [] : []
    }, // 2 minutes - cart doesn't change that often
    enabled: !!userId,
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

  // Fetch cart data when login state changes
  useEffect(() => {
    if (isLoggedIn) {
      refetchCart()
    }
  }, [isLoggedIn, refetchCart])

  // Search suggestions query dengan API endpoint yang lebih efisien
  const { data: searchSuggestions = [], isLoading: isSearchLoading } = useQuery(
    {
      queryKey: ['searchSuggestions', debouncedSearchQuery],
      queryFn: async () => {
        if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) return []

        try {
          const response = await fetch(
            `/api/products/search?q=${encodeURIComponent(
              debouncedSearchQuery
            )}&limit=5`
          )

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Search API error:', response.status, errorText)
            return []
          }

          const data = await response.json()
          return data && data.products ? data.products : []
        } catch (error) {
          console.error('Search error:', error)
          return []
        }
      },
      enabled: debouncedSearchQuery.length >= 2,
      staleTime: 2 * 60 * 1000, // 2 minutes cache
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      retry: 1, // Only retry once
      retryDelay: 1000, // Wait 1 second before retry
    }
  )

  // --- Badge Calculation ---
  let validItems = []
  let calculatedBadgeCount = 0

  try {
    // Make sure cartData is an array before trying to filter it
    if (cartData && Array.isArray(cartData)) {
      validItems = cartData.filter((item) => {
        return (
          item &&
          item.quantity &&
          item.product &&
          item.product.minOrder &&
          item.quantity >= item.product.minOrder
        )
      })

      calculatedBadgeCount = validItems.reduce((totalUnits, item) => {
        const quantity = item.quantity
        const minOrder = item.product.minOrder
        const multiOrder = item.product.multiOrder || 1
        const effectiveMultiOrder = multiOrder > 0 ? multiOrder : 1

        let itemConvertedUnits = 1
        const remainingQuantity = quantity - minOrder
        itemConvertedUnits += Math.floor(
          remainingQuantity / effectiveMultiOrder
        )

        return totalUnits + itemConvertedUnits
      }, 0)
    }
  } catch (error) {
    console.error('Error calculating badge count:', error)
    calculatedBadgeCount = 0
  }
  // --- End of Badge Calculation ---

  const unreadNotifications =
    notificationsData?.filter((n) => !n.isRead).length || 0

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/kategori?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      setSelectedIndex(-1)
      setShowSuggestions(value.length >= 2)
    },
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch(e as any)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && searchSuggestions[selectedIndex]) {
          handleSuggestionClick(searchSuggestions[selectedIndex])
        } else {
          handleSearch(e as any)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = useCallback(
    (product: any) => {
      const categoryUrl = product.category?.parent
        ? `/kategori/${product.category.parent.slug}/${product.category.slug}/${product.slug}`
        : `/kategori/${product.category?.slug}/${product.slug}`

      router.push(categoryUrl)
      setSearchQuery('')
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    },
    [router]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

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
      {/* Search Bar with Suggestions */}
      <div className='flex-1 max-w-xl mx-4 xl:mx-8' ref={searchRef}>
        <form onSubmit={handleSearch} className='relative w-full'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10'>
            <Search size={20} />
          </span>
          <Input
            ref={inputRef}
            type='search'
            placeholder='Cari produk...'
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            className='pl-10 pr-16 py-2 h-10 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition bg-background'
            autoComplete='off'
          />

          {/* Clear button */}
          {searchQuery && (
            <Button
              type='button'
              size='icon'
              variant='ghost'
              onClick={clearSearch}
              className='absolute right-9 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-gray-100'>
              <X size={14} />
            </Button>
          )}

          {/* Search button */}
          <Button
            type='submit'
            size='icon'
            variant='ghost'
            className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'>
            <Search size={16} />
          </Button>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.length >= 2 && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'>
              {isSearchLoading ? (
                <div className='p-4 text-center text-gray-500'>
                  <div className='flex items-center justify-center gap-2'>
                    <div className='animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full'></div>
                    <span className='text-sm'>Mencari...</span>
                  </div>
                </div>
              ) : searchSuggestions.length > 0 ? (
                <>
                  {searchSuggestions.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className={cn(
                        'flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0',
                        selectedIndex === index && 'bg-gray-50'
                      )}>
                      <div className='w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative'>
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className='w-full h-full object-cover'
                            loading='lazy'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">IMG</div>'
                              }
                            }}
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium'>
                            IMG
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm text-gray-900 truncate'>
                          {product.name}
                        </h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-sm font-bold text-primary'>
                            Rp {product.price?.toLocaleString('id-ID')}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {product.category?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show all results option */}
                  <div
                    onClick={handleSearch}
                    className='flex items-center justify-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-t border-gray-200 text-primary font-medium'>
                    <Search size={16} />
                    Lihat semua hasil untuk "{searchQuery}"
                  </div>
                </>
              ) : (
                <div className='p-4 text-center text-gray-500'>
                  <Search size={24} className='mx-auto mb-2 text-gray-400' />
                  Tidak ada produk ditemukan untuk "{searchQuery}"
                  <div
                    onClick={handleSearch}
                    className='mt-2 text-primary hover:underline cursor-pointer'>
                    Lihat semua hasil
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* User Actions */}
      <div className='flex items-center gap-2 xl:gap-4 shrink-0'>
        <Link href='/notifikasi'>
          <Button size='icon' variant='ghost' className='relative'>
            <Bell size={20} className='text-foreground' />
            {mounted && unreadNotifications > 0 && (
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
              {mounted && calculatedBadgeCount > 0 && (
                <Badge
                  variant='default'
                  className='absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-1 text-xs'>
                  {calculatedBadgeCount}
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
