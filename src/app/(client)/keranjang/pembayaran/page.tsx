import { getCartItems } from '@/app/actions/cartAction'
import PaymentForm from './PaymentForm'
import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } & Promise<any>
}) {
  const session = await validateSession()
  if (!session?.user) {
    redirect('/login')
  }

  const cartData = await getCartItems()

  // Filter cart items based on selected items
  if (searchParams.items && cartData.success) {
    const selectedItemIds = Array.isArray(searchParams.items)
      ? searchParams.items
      : (searchParams.items as string).split(',')
    cartData.data = cartData.data.filter((item: any) =>
      selectedItemIds.includes(item.id.toString())
    )

    // Ensure total amount is calculated correctly for Midtrans
    const subtotal = cartData.data.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
    const ppn = Math.round(subtotal * 0.11)
    const totalAmount = subtotal + ppn

    cartData.subtotal = subtotal
    cartData.ppn = ppn
    cartData.totalAmount = totalAmount
  }

  return (
    <div className=''>
      <PaymentForm
        cookies={session}
        initialCartData={cartData}
        customerProfile={session?.user?.profile || null}
      />
    </div>
  )
}
