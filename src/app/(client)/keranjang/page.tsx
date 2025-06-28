import CartClient from './CartClient'
import { Suspense } from 'react'
import { getCartItems, removeFromCart } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const session = await validateSession()
  const [cartData, validate] = await Promise.all([
    getCartItems(session?.user?.id),
    validateSession(),
  ])

  return (
    <div className='container mx-auto py-10 px-4'>
      <Link href='/' className='items-center gap-2 flex cursor-pointer mb-6'>
        <ChevronLeft />
        Kembali
      </Link>
      <h3 className='text-2xl font-bold mb-6'>Keranjang Belanja</h3>
      <CartClient
        initialCartData={cartData}
        validate={validate}
        removeItem={removeFromCart}
      />
    </div>
  )
}
