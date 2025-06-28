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

  const cartData = await getCartItems(session?.user?.id)

  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams

  // Filter cart items based on selected items
  if (resolvedSearchParams.items && cartData.success) {
    const selectedItemIds = Array.isArray(resolvedSearchParams.items)
      ? resolvedSearchParams.items
      : (resolvedSearchParams.items as string).split(',')
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

    // Add calculated values to cartData object
    const enhancedCartData = {
      ...cartData,
      subtotal,
      ppn,
      totalAmount,
    }

    return (
      <div className=''>
        <PaymentForm
          cookies={session}
          initialCartData={enhancedCartData}
          customerProfile={session?.user?.profile || null}
        />
      </div>
    )
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
