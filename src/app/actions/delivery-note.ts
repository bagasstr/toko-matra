'use server'

import { generateCustomId } from '@/lib/helpper'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type DeliveryNoteStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED'

export async function getDeliveryNotes() {
  try {
    const deliveryNotes = await prisma.shipment.findMany({
      include: {
        order: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            address: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: deliveryNotes }
  } catch (error) {
    console.error('[GET_DELIVERY_NOTES]', error)
    return { success: false, error: 'Internal error' }
  }
}

export async function getDeliveryNoteById(id: string) {
  try {
    const deliveryNote = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            address: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!deliveryNote) {
      return { error: 'Delivery note not found' }
    }

    return { data: deliveryNote }
  } catch (error) {
    console.error('[GET_DELIVERY_NOTE_BY_ID]', error)
    return { error: 'Internal error' }
  }
}

export async function createDeliveryNote(orderId: string) {
  try {
    // Check if order exists and is paid
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return { error: 'Order not found' }
    }

    // Check if order is paid
    const isPaid = order.payment.some((payment) => payment.status === 'PAID')

    if (!isPaid) {
      return { error: 'Order is not paid yet' }
    }

    // Check if delivery note already exists
    const existingDeliveryNote = await prisma.shipment.findUnique({
      where: { orderId },
    })

    if (existingDeliveryNote) {
      return { error: 'Delivery note already exists for this order' }
    }

    // Generate delivery number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await prisma.shipment.count({
      where: {
        createdAt: {
          gte: new Date(year, date.getMonth(), 1),
          lt: new Date(year, date.getMonth() + 1, 1),
        },
      },
    })
    const deliveryNumber = `SJ-${year}${month}-${String(count + 1).padStart(
      3,
      '0'
    )}`

    // Create delivery note
    const deliveryNote = await prisma.shipment.create({
      data: {
        id: generateCustomId('sj'),
        deliveryNumber: deliveryNumber,
        deliveryDate: new Date(),
        status: 'PENDING',
        orderId,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.product.unit,
            id: item.id,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    console.log(deliveryNote)
    revalidatePath('/admin/delivery-notes')
    return { data: deliveryNote }
  } catch (error) {
    console.error('[CREATE_DELIVERY_NOTE]', error)
    return { error: 'Internal error' }
  }
}

export async function updateDeliveryNoteStatus(
  id: string,
  status: DeliveryNoteStatus
) {
  try {
    const deliveryNote = await prisma.shipment.update({
      where: { id },
      data: { status },
    })

    revalidatePath('/admin/delivery-notes')
    return { data: deliveryNote }
  } catch (error) {
    console.error('[UPDATE_DELIVERY_NOTE_STATUS]', error)
    return { error: 'Internal error' }
  }
}

export async function getPaidOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    console.log(orders)
    return { success: true, data: orders }
  } catch (error) {
    console.error('[GET_PAID_ORDERS]', error)
    return { success: false, error: 'Internal error' }
  }
}
