import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import { useCartStore } from '@/lib/store'

const Navbar = () => {
  const { items } = useCartStore()
  const cartItemsCount = items.length

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <span className='text-xl font-bold'>Building Materials</span>
          </Link>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-6'>
            <Link
              href='/products'
              className='text-sm font-medium hover:text-primary'>
              Products
            </Link>
            <Link
              href='/categories'
              className='text-sm font-medium hover:text-primary'>
              Categories
            </Link>
            <Link
              href='/about'
              className='text-sm font-medium hover:text-primary'>
              About
            </Link>
            <Link
              href='/contact'
              className='text-sm font-medium hover:text-primary'>
              Contact
            </Link>
          </div>

          {/* Search and Cart */}
          <div className='flex items-center space-x-4'>
            {/* Search */}
            <div className='hidden lg:flex items-center space-x-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search products...'
                  className='w-[200px] pl-9 h-9'
                />
              </div>
            </div>

            {/* Cart */}
            <Link href='/cart'>
              <Button variant='ghost' size='icon' className='relative'>
                <ShoppingCart className='h-5 w-5' />
                {cartItemsCount > 0 && (
                  <span className='absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center'>
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant='ghost' size='icon' className='md:hidden'>
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
