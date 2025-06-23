import React from 'react'
import WishlistComp from './wishlistComp'
import { getWishlist } from '@/app/actions/wishlist'
import { getAllCategories } from '@/app/actions/categoryAction'
import { validateSession } from '@/app/actions/session'

const page = async () => {
  const session = await validateSession()
  const userId = session?.user?.id
  if (!userId) {
    return (
      <div className='p-8 text-center text-gray-500'>
        Silakan login untuk melihat wishlist Anda.
      </div>
    )
  }
  const wishlist = await getWishlist(userId)
  const categories = await getAllCategories()
  return (
    <WishlistComp wishlist={wishlist} categories={categories} userId={userId} />
  )
}

export default page
