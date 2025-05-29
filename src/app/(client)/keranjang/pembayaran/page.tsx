import { getCartItems } from '@/app/actions/cartAction'
import PaymentForm from './PaymentForm'
import { Suspense } from 'react'
import { validateSession } from '@/app/actions/session'

export const dynamic = 'force-dynamic'

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { items?: string }
}) {
  const cartData = await getCartItems()
  const session = await validateSession()

  const userId = session?.user?.profile.id.toLowerCase()
  const customerProfile = session?.user?.profile || null

  // Filter cart items based on selected items
  if (searchParams.items && cartData.success) {
    const selectedItemIds = searchParams.items.split(',')
    cartData.data = cartData.data.filter((item: any) =>
      selectedItemIds.includes(item.id)
    )
  }

  return (
    <div className=''>
      <PaymentForm
        cookies={session}
        initialCartData={cartData}
        customerProfile={customerProfile}
      />
    </div>
  )
}
