'use server'

import { createOrder } from '@/app/actions/orderAction'
import { getCartItems } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'

interface CheckoutFormData {
  addressId: string
  paymentMethod: string
  notes?: string
}

export async function processCheckout(formData: CheckoutFormData) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    // Get cart items
    const cartResult = await getCartItems()
    if (
      !cartResult.success ||
      !cartResult.data ||
      cartResult.data.length === 0
    ) {
      return {
        success: false,
        message: 'Cart is empty or could not be retrieved',
      }
    }

    // Prepare order items
    const items = cartResult.data.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.product.price),
    }))

    // Create order
    const orderResult = await createOrder({
      addressId: formData.addressId,
      items,
      paymentMethod: formData.paymentMethod,
    })

    if (!orderResult.success) {
      return orderResult
    }

    // Force conversion of any Decimal objects by stringifying and parsing
    const safeData = JSON.parse(JSON.stringify(orderResult.data))

    // Return success with order data
    return {
      data: safeData,
      success: true,
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('Error processing checkout:', error)
    return {
      success: false,
      message: 'Failed to process checkout',
      error,
    }
  }
}
