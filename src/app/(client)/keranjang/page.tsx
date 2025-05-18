import CartClient from './CartClient'
import { Suspense } from 'react'
import {
  updateCartItemQuantity,
  clearCart,
  getCartItems,
  removeFromCart,
} from '@/app/actions/cartAction'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const cartData = await getCartItems()

  return (
    <Suspense
      fallback={
        <div className='max-w-3xl mx-auto py-10 px-4'>
          <h1 className='text-2xl font-bold mb-6'>Keranjang Belanja</h1>
          <div className='text-gray-400 text-center py-10'>
            Memuat keranjang...
          </div>
        </div>
      }>
      <CartClient initialCartData={cartData} removeItem={removeFromCart} />
    </Suspense>
  )
}
