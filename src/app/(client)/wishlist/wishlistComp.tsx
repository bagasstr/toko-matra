'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RiArrowLeftLine, RiDeleteBinLine } from '@remixicon/react'
import { removeFromWishlist } from '@/app/actions/wishlist'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const WishlistComp = ({
  wishlist,
  categories,
  userId,
}: {
  wishlist: any
  categories: any
  userId: string
}) => {
  const router = useRouter()
  console.log('wishlist:', wishlist)
  const handleRemoveFromWishlist = async (id: string) => {
    await removeFromWishlist(userId, id)
    toast.success('Produk berhasil dihapus dari wishlist')
    router.refresh()
  }
  const categorySlug = categories?.categorie?.find((item) =>
    wishlist.some(
      (wishlistItem) => item.id === wishlistItem.product?.category?.parentId
    )
  )?.slug

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <div className='flex items-center gap-2 mb-6'>
        <Link
          href={{
            pathname: '/profile',
            query: {
              user: userId,
            },
          }}>
          <Button variant='ghost' size='icon' className='mr-2'>
            <RiArrowLeftLine size={22} />
          </Button>
        </Link>
        <h1 className='text-2xl font-bold tracking-tight'>Wishlist</h1>
      </div>
      <div className='space-y-4'>
        {wishlist.length === 0 && (
          <div className='text-center text-gray-400 py-12 border rounded-lg bg-white'>
            Belum ada produk di wishlist
          </div>
        )}
        {wishlist
          .filter((item) => item.product)
          .map((item) => (
            <div
              key={item.id}
              className='flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition group relative'>
              <Link
                href={
                  item.product.category
                    ? `/kategori/${categorySlug}/${item.product.category.slug}/${item.product.slug}`
                    : `/produk/${item.product.slug}`
                }
                className='flex items-center gap-4 flex-1 min-w-0'>
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={72}
                  height={72}
                  className='rounded object-contain border bg-gray-50 w-20 h-20'
                />
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-gray-900 text-base truncate mb-1'>
                    {item.product.name}
                  </div>
                  <div className='text-primary font-bold text-lg mb-1'>
                    Rp{item.product.price.toLocaleString('id-ID')}
                  </div>
                  <div className='text-xs text-gray-400 truncate'>
                    {item.product.category?.name}
                  </div>
                </div>
              </Link>
              <Button
                variant='ghost'
                size='icon'
                className='text-red-500 hover:text-red-700 p-2 ml-2'
                onClick={() => handleRemoveFromWishlist(item.id)}
                aria-label='Hapus dari wishlist'>
                <RiDeleteBinLine size={20} />
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}

export default WishlistComp
