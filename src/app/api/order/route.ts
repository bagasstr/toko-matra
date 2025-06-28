import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/app/actions/session'
import { generateCustomId } from '@/lib/helpper'

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export async function POST(request: Request) {
  try {
    // Validate session
    const session = await validateSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { addressId, items, paymentMethod } = body

    // Validate input
    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Items are required and must be an array' },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
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

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          id: generateCustomId('ORD'),
          userId: session.user.id,
          addressId,
          totalAmount,
          status: OrderStatus.PENDING,
        },
      })

      // 2. Create order items
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

      // 3. Create payment record
      const payment = await tx.payment.create({
        data: {
          id: generateCustomId('PAY'),
          orderId: order.id,
          amount: totalAmount,
          paymentMethod,
          status: 'PENDING',
        },
      })

      // 5. Update product stock
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

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order',
      },
      { status: 500 }
    )
  }
}
