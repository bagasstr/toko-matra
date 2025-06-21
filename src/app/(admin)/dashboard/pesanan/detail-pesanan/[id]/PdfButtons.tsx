'use client'

import dynamic from 'next/dynamic'

// Dynamic import untuk menghindari SSR error
const OrderDetailPdfButton = dynamic(
  () =>
    import('@/app/(client)/components/DownloadPdfButton').then((mod) => ({
      default: mod.OrderDetailPdfButton,
    })),
  { ssr: false }
)

const PurchaseOrderPdfButton = dynamic(
  () =>
    import('@/app/(client)/components/DownloadPdfButton').then((mod) => ({
      default: mod.PurchaseOrderPdfButton,
    })),
  { ssr: false }
)

interface PdfData {
  items: Array<{
    product: {
      name: string
      price: number
      unit: string
      sku: string
      description: string
    }
    quantity: number
  }>
  subtotal: number
  ppn: number
  total: number
  logoBase64: string
  orderId: string
  orderDate: string
  customerName: string
  customerCompany: string
  customerAddress: string
  customerEmail: string
  customerPhone: string
  notes: string
}

interface PdfButtonsProps {
  data: PdfData
}

export function PdfButtons({ data }: PdfButtonsProps) {
  return (
    <div className='flex items-center gap-2'>
      <OrderDetailPdfButton
        items={data.items}
        subtotal={data.subtotal}
        ppn={data.ppn}
        total={data.total}
        logoBase64={data.logoBase64}
        orderId={data.orderId}
        orderDate={data.orderDate}
        customerName={data.customerName}
        customerCompany={data.customerCompany}
        customerAddress={data.customerAddress}
        customerEmail={data.customerEmail}
        customerPhone={data.customerPhone}
        notes={data.notes}
        disabled={false}
      />
      <span className='text-sm text-gray-500'>Unduh Faktur</span>

      {/* Contoh Purchase Order PDF */}
      <PurchaseOrderPdfButton
        items={data.items}
        subtotal={data.subtotal}
        ppn={data.ppn}
        total={data.total}
        logoBase64={data.logoBase64}
        poNumber={`PO-${data.orderId.replace('ord', '')}`}
        poDate={new Date().toLocaleDateString('id-ID')}
        supplierName='PT Supplier Example'
        supplierCompany='Supplier Corp'
        supplierAddress='Jl. Supplier No. 123, Jakarta'
        supplierEmail='supplier@example.com'
        supplierPhone='+62 21 1234 5678'
        supplierTaxId='12.345.678.9-123.456'
        deliveryAddress={data.customerAddress}
        deliveryDate={new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString('id-ID')}
        paymentTerms='Net 30 days'
        notes='Mohon kirim barang sesuai spesifikasi yang diminta'
        disabled={false}
      />
      <span className='text-sm text-gray-500'>Unduh PO</span>
    </div>
  )
}
