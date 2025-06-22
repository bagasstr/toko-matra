'use client'

import React, { useEffect } from 'react'
import OptimizedImage from '@/components/OptimizedImage'
import { Button } from '@/components/ui/button'
import { RiArrowLeftLine, RiDeleteBinLine } from '@remixicon/react'
import { removeFromWishlist } from '@/app/actions/wishlist'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const WishlistComp = ({
  wishlist,
  categories,
}: {
  wishlist: any
  categories: any
}) => {
  const router = useRouter()
  const handleRemoveFromWishlist = async (id: string) => {
    const res = await removeFromWishlist(id)
    if (res.success) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }
  console.log(wishlist)
  console.log(categories)
  const categorySlug = categories?.categorie?.find((item) =>
    wishlist.some(
      (wishlistItem) => item.id === wishlistItem.product.category.parentId
    )
  )?.slug // ambil slug dari kategori yang memiliki parentId yang sama dengan wishlist
  console.log(categorySlug)
  return (
    <div className='p-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Link href={`/kategori/${categorySlug}`}>
          <Button variant='ghost' size='icon'>
            <RiArrowLeftLine size={20} />
          </Button>
        </Link>
        <h1 className='text-xl font-bold'>Wishlist</h1>
      </div>
      {wishlist.map((item) => (
        <Link
          href={`/kategori/${categorySlug}/${item.product.category.slug}/${item.product.slug}`}
          key={item.id}
          className='flex items-center gap-4 py-3 px-2 bg-white hover:bg-gray-50 transition border rounded-md'>
          <OptimizedImage
            src={item.product.images[0]}
            alt={item.product.name}
            width={56}
            height={56}
            className='rounded object-contain'
            priority={false}
          />
          <div className='flex-1'>
            <div className='font-medium text-gray-800 text-sm'>
              {item.product.name}
            </div>
            <div className='text-blue-600 font-semibold text-base'>
              Rp{item.product.price.toLocaleString('id-ID')}
            </div>
          </div>
          <Button
            variant='outline'
            size='icon'
            className='text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded transition'
            onClick={() => handleRemoveFromWishlist(item.id)}>
            <RiDeleteBinLine size={20} />
          </Button>
        </Link>
      ))}
      {wishlist.length === 0 && (
        <div className='text-center text-gray-400 py-8'>
          Belum ada produk di wishlist
        </div>
      )}
    </div>
  )
}

export default WishlistComp
