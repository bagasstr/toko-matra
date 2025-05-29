import React from 'react'
import WishlistComp from './wishlistComp'
import { getWishlist } from '@/app/actions/wishlist'

const page = async () => {
  const wishlist = await getWishlist()
  return <WishlistComp wishlist={wishlist} />
}

export default page
