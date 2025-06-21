'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { generateFakturPDF } from '@/lib/pdfFakturFormatter'

interface PrintInvoiceButtonProps {
  order: any
}

export function PrintInvoiceButton({ order }: PrintInvoiceButtonProps) {
  const handlePrintInvoice = async () => {
    // Ambil logo base64 jika ada, atau gunakan string kosong
    const logoBase64 = '' // TODO: ganti dengan logo base64 jika ada
    const invoiceNumber = order.id
    const invoiceDate = new Date(order.createdAt).toLocaleString('id-ID')
    const customerName = order.user?.profile?.fullName || '-'
    const customerCompany = order.user?.profile?.company || '-'
    const customerLabelAddress = order.address?.city || '-'
    const customerAddress = `${order.address?.address || ''}, ${
      order.address?.city || ''
    }, ${order.address?.province || ''}`
    const customerEmail = order.user?.email || '-'
    const customerPhone = order.user?.profile?.phone || '-'
    const notes = order.notes || ''
    const items = order.items.map((item: any) => ({
      id: item.id,
      product: {
        name: item.product.name,
        price: item.price,
        unit: item.product.unit || 'pcs',
        sku: item.product.sku || '',
        description: item.product.description || '',
      },
      quantity: item.quantity,
    }))
    const total = order.totalAmount
    const htmlContent = generateFakturPDF(
      items,
      total,
      logoBase64,
      invoiceNumber,
      invoiceDate,
      customerName,
      customerCompany,
      customerLabelAddress,
      customerAddress,
      customerEmail,
      customerPhone,
      notes
    )
    // Buat PDF dari htmlContent (bisa pakai html2pdf.js atau library lain)
    // Contoh: window.print() atau download html sebagai PDF
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `invoice-${order.id}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <Button onClick={handlePrintInvoice} variant='outline'>
      <Download className='h-5 w-5 mr-2' /> Cetak Invoice (HTML)
    </Button>
  )
}
