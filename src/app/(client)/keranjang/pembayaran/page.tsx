import { getCartItems } from '@/app/actions/cartAction'
import PaymentForm from './PaymentForm'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function PaymentPage() {
  const cartData = await getCartItems()

  return (
    <Suspense
      fallback={
        <div className='max-w-5xl mx-auto py-10 px-4'>
          <h1 className='text-2xl font-bold mb-6'>Pembayaran</h1>
          <div className='text-gray-400 text-center py-10'>
            Memuat data pembayaran...
          </div>
        </div>
      }>
      <PaymentForm initialCartData={cartData} />
    </Suspense>
  )
}
