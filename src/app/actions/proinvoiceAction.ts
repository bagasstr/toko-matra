'use server'

import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'
import { validateSession } from './session'
import { revalidatePath } from 'next/cache'

export async function createProformaInvoiceFromCart(
  cartItems: {
    product: {
      id: string
      price: number
      unit: string
    }
    quantity: number
  }[],
  customerData: {
    name: string
    address: string
    phone?: string
    email?: string
  },
  notes?: string
) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const diskon = 0
    const ppn = Math.round((subtotal - diskon) * 0.11)
    const total = subtotal + ppn - diskon

    // Check for existing proforma invoice for this cart
    const existingInvoice = await prisma.proformaInvoice.findFirst({
      where: {
        createdBy: session.user.id,
        status: 'DRAFT',
        items: {
          some: {
            productId: cartItems[0].product.id,
          },
        },
      },
      include: {
        items: true,
      },
    })

    if (existingInvoice) {
      // Update existing invoice
      const updatedInvoice = await prisma.proformaInvoice.update({
        where: {
          id: existingInvoice.id,
        },
        data: {
          customerName: customerData.name,
          customerAddress: customerData.address,
          customerPhone: customerData.phone,
          customerEmail: customerData.email,
          subtotal: Number(subtotal.toFixed(2)),
          diskon: Number(diskon.toFixed(2)),
          ppn: Number(ppn.toFixed(2)),
          total: Number(total.toFixed(2)),
          notes,
          items: {
            deleteMany: {},
            create: cartItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: Number(item.product.price.toFixed(2)),
              unit: item.product.unit,
              total: Number((item.product.price * item.quantity).toFixed(2)),
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
      return { success: true, data: updatedInvoice }
    }

    // Generate invoice number for new invoice
    const invoiceNumber = await generateInvoiceNumber('PI')

    // Create new proforma invoice
    const proformaInvoice = await prisma.proformaInvoice.create({
      data: {
        invoiceNumber,
        invoiceDate: new Date(),
        customerName: customerData.name,
        customerAddress: customerData.address,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        subtotal: Number(subtotal.toFixed(2)),
        diskon: Number(diskon.toFixed(2)),
        ppn: Number(ppn.toFixed(2)),
        total: Number(total.toFixed(2)),
        notes,
        status: 'DRAFT',
        createdBy: session.user.id,
        convertedToInvoice: false,
        items: {
          create: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: Number(item.product.price.toFixed(2)),
            unit: item.product.unit,
            total: Number((item.product.price * item.quantity).toFixed(2)),
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

    revalidatePath('/dashboard/proforma-invoices')
    return { success: true, data: proformaInvoice }
  } catch (error) {
    console.error('Error creating proforma invoice:', error)
    return { success: false, error: 'Failed to create proforma invoice' }
  }
}

export async function getProformaInvoices() {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const proformaInvoices = await prisma.proformaInvoice.findMany({
      where: {
        createdBy: session.user.id,
      },
      include: {
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

    return { success: true, data: proformaInvoices }
  } catch (error) {
    console.error('Error fetching proforma invoices:', error)
    return { success: false, error: 'Failed to fetch proforma invoices' }
  }
}

export async function getProformaInvoiceById(id: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const proformaInvoice = await prisma.proformaInvoice.findUnique({
      where: {
        id,
        createdBy: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!proformaInvoice) {
      throw new Error('Proforma invoice not found')
    }

    return { success: true, data: proformaInvoice }
  } catch (error) {
    console.error('Error fetching proforma invoice:', error)
    return { success: false, error: 'Failed to fetch proforma invoice' }
  }
}

export async function saveProformaInvoiceDownload(id: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Update the proforma invoice with download timestamp
    const proformaInvoice = await prisma.proformaInvoice.update({
      where: {
        id,
        createdBy: session.user.id,
      },
      data: {
        downloadedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!proformaInvoice) {
      throw new Error('Proforma invoice not found')
    }

    revalidatePath('/dashboard/proforma-invoices')
    return { success: true, data: proformaInvoice }
  } catch (error) {
    console.error('Error saving proforma invoice download:', error)
    return { success: false, error: 'Failed to save proforma invoice download' }
  }
}
