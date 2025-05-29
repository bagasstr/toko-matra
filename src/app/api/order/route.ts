import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/app/actions/session'
import { generateCustomId } from '@/lib/helpper'
import { OrderStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('=== Order Creation API Debug Log ===')

    console.log('1. Validating session...')
    const session = await validateSession()
    if (!session?.user) {
      console.log('Session validation failed')
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }
    console.log('Session validated:', { userId: session.user.id })

    console.log('2. Parsing request body...')
    const body = await request.json()
    console.log('Request body:', body)
    const { addressId, items, paymentMethod } = body

    // Validate input
    if (!addressId) {
      console.log('Missing address ID')
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items data:', items)
      return NextResponse.json(
        { success: false, message: 'Items are required and must be an array' },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
      console.log('Missing payment method')
      return NextResponse.json(
        { success: false, message: 'Payment method is required' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    console.log('3. Starting transaction...')
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      console.log('Creating order...')
      const order = await tx.order.create({
        data: {
          id: generateCustomId('ORD'),
          userId: session.user.id,
          addressId,
          totalAmount,
          status: OrderStatus.PENDING,
        },
      })
      console.log('Order created:', order)

      // 2. Create order items
      console.log('Creating order items...')
      const orderItems = await Promise.all(
        items.map(async (item) => {
          return tx.orderItem.create({
            data: {
              id: generateCustomId('ORD-ITM'),
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          })
        })
      )
      console.log('Order items created:', orderItems)

      // 3. Create payment record
      console.log('Creating payment record...')
      const payment = await tx.payment.create({
        data: {
          id: generateCustomId('PAY'),
          orderId: order.id,
          amount: totalAmount,
          paymentMethod,
          status: 'PENDING',
        },
      })
      console.log('Payment record created:', payment)

      // 5. Update product stock
      console.log('Updating product stock...')
      await Promise.all(
        items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          })

          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: product.stock - item.quantity },
            })
          }
        })
      )

      // 6. Clear cart
      console.log('Clearing cart...')
      const cart = await tx.cart.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      })

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        })
      }

      return {
        order,
        orderItems,
        payment,
      }
    })

    console.log('4. Transaction completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
