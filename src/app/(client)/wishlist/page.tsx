import React from 'react'
import WishlistComp from './wishlistComp'
import { getWishlist } from '@/app/actions/wishlist'
import { getAllCategories } from '@/app/actions/categoryAction'

const page = async () => {
  const wishlist = await getWishlist()
  const categories = await getAllCategories()
  return <WishlistComp wishlist={wishlist} categories={categories} />
}

export default page
