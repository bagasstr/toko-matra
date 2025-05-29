'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNumber } from '@/lib/utils'

export async function createInvoiceFromProforma(proformaInvoiceId: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Get proforma invoice with items
    const proformaInvoice = await prisma.proformaInvoice.findUnique({
      where: {
        id: proformaInvoiceId,
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

    if (proformaInvoice.convertedToInvoice) {
      throw new Error('Proforma invoice already converted')
    }

    // Generate new invoice number
    const invoiceNumber = await generateInvoiceNumber('inv')

    // Create new invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceDate: new Date(),
        customerName: proformaInvoice.customerName,
        customerAddress: proformaInvoice.customerAddress,
        customerPhone: proformaInvoice.customerPhone,
        customerEmail: proformaInvoice.customerEmail,
        subtotal: proformaInvoice.subtotal,
        diskon: proformaInvoice.diskon,
        ppn: proformaInvoice.ppn,
        total: proformaInvoice.total,
        notes: proformaInvoice.notes,
        createdBy: session.user.id,
        items: {
          create: proformaInvoice.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            unit: item.unit,
            total: item.total,
          })),
        },
      },
    })

    // Update proforma invoice status
    await prisma.proformaInvoice.update({
      where: {
        id: proformaInvoiceId,
      },
      data: {
        status: 'CONVERTED',
        convertedToInvoice: true,
        convertedInvoiceId: invoice.id,
      },
    })

    revalidatePath('/dashboard/invoices')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function getInvoices() {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const invoices = await prisma.invoice.findMany({
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

    return { success: true, data: invoices }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return { success: false, error: 'Failed to fetch invoices' }
  }
}

export async function getInvoiceById(id: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const invoice = await prisma.invoice.findUnique({
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

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return { success: false, error: 'Failed to fetch invoice' }
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const invoice = await prisma.invoice.update({
      where: {
        id,
        createdBy: session.user.id,
      },
      data: {
        status,
      },
    })

    revalidatePath('/dashboard/invoices')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return { success: false, error: 'Failed to update invoice status' }
  }
}

export async function deleteInvoice(id: string) {
  try {
    const session = await validateSession()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Check if invoice exists and belongs to user
    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
        createdBy: session.user.id,
      },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Delete invoice (items will be deleted due to cascade)
    await prisma.invoice.delete({
      where: {
        id,
      },
    })

    revalidatePath('/dashboard/invoices')
    return { success: true }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { success: false, error: 'Failed to delete invoice' }
  }
}
