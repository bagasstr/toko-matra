'use client'

import { generatePdfFromHtml } from '@/app/actions/pdfAction'
import { Button } from '@/components/ui/button'
import { Download, Printer, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/orderAction'
import { OrderStatus } from '@/types/order'
import { useReactToPrint } from 'react-to-print'
import { pdf } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PdfDocument } from '@/components/pdf/PdfDocument'

interface ReactToPrintProps {
  content: () => React.ReactInstance | null
  documentTitle?: string
  onBeforePrint?: () => Promise<void>
  onAfterPrint?: () => Promise<void>
  onError?: () => Promise<void>
}

type CartButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      priceExclPPN?: number
      weight?: number
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  totalWeight?: number
  logoBase64: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    company?: string
  }
  disabled?: boolean
}

type SJButtonProps = {
  htmlContent: string
  disabled?: boolean
  orderId?: string
}

type FakturButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      priceExclPPN?: number
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  logoBase64: string
  customerName?: string
  customerCompany?: string
  customerAddress?: string
  customerEmail?: string
  customerPhone?: string
  disabled?: boolean
}

type OrderDetailButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      description?: string
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  logoBase64: string
  orderId: string
  orderDate: string
  customerName: string
  customerCompany?: string
  customerAddress: string
  customerEmail: string
  customerPhone: string
  notes?: string
  disabled?: boolean
}

type PaymentPdfButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      description?: string
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  logoBase64: string
  customerName: string
  customerCompany?: string
  customerAddress: string
  customerEmail: string
  customerPhone: string
  notes?: string
  disabled?: boolean
}

type ProInvoicePdfButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      description?: string
      weight?: number
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  totalWeight?: number
  logoBase64: string
  proInvoiceNumber: string
  proInvoiceDate: string
  customerName: string
  customerCompany?: string
  customerAddress: string
  customerEmail: string
  customerPhone: string
  customerTaxId?: string
  notes?: string
  terms?: string
  disabled?: boolean
}

type PurchaseOrderPdfButtonProps = {
  items: {
    product: {
      name: string
      price: number
      unit: string
      sku?: string
      description?: string
    }
    quantity: number
  }[]
  subtotal: number
  ppn: number
  total: number
  logoBase64: string
  poNumber: string
  poDate: string
  supplierName: string
  supplierCompany?: string
  supplierAddress: string
  supplierEmail: string
  supplierPhone: string
  supplierTaxId?: string
  deliveryAddress: string
  deliveryDate: string
  paymentTerms: string
  notes?: string
  disabled?: boolean
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 120,
    color: 'rgba(147, 147, 147, 0.1)',
    zIndex: 0,
  },
})

// const PdfDocument = ({ content }: { content: string }) => (
//   <Document>
//     <Page size='A4' style={styles.page}>
//       <View>
//         <Text style={styles.watermark}>LUNAS</Text>
//         <div dangerouslySetInnerHTML={{ __html: content }} />
//       </View>
//     </Page>
//   </Document>
// )

export function PdfCartButton({
  items,
  subtotal,
  ppn,
  total,
  totalWeight,
  logoBase64,
  customerInfo,
  disabled,
}: CartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            totalWeight,
            logoBase64,
            customerInfo,
            type: 'cart',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}

export function PdfSJButton({ htmlContent, disabled, orderId }: SJButtonProps) {
  const handleDownload = async () => {
    if (orderId) {
      const updateOrder = await updateOrderStatus(orderId, OrderStatus.SHIPPED)
      if (!updateOrder.success) {
        throw new Error(updateOrder.error)
      }
      if (updateOrder.success) {
        const res = await generatePdfFromHtml(htmlContent)
        const blob = new Blob([res], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'surat-jalan.pdf'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    }
  }

  return (
    <Button disabled={disabled} variant='outline' onClick={handleDownload}>
      <Printer className='h-5 w-5' />
      Print
    </Button>
  )
}

export function PdfFakturButton({
  items,
  subtotal,
  ppn,
  total,
  logoBase64,
  customerName,
  customerCompany,
  customerAddress,
  customerEmail,
  customerPhone,
  disabled,
}: FakturButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            logoBase64,
            customerName,
            customerCompany,
            customerAddress,
            customerEmail,
            customerPhone,
            type: 'order-detail',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}

export function PaymentPdfButton({
  items,
  subtotal,
  ppn,
  total,
  logoBase64,
  customerName,
  customerCompany,
  customerAddress,
  customerEmail,
  customerPhone,
  notes,
  disabled,
}: PaymentPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            logoBase64,
            customerName,
            customerCompany,
            customerAddress,
            customerEmail,
            customerPhone,
            notes,
            type: 'payment',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}

export function OrderDetailPdfButton({
  items,
  subtotal,
  ppn,
  total,
  logoBase64,
  orderId,
  orderDate,
  customerName,
  customerCompany,
  customerAddress,
  customerEmail,
  customerPhone,
  notes,
  disabled,
}: OrderDetailButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            logoBase64,
            orderId,
            orderDate,
            customerName,
            customerCompany,
            customerAddress,
            customerEmail,
            customerPhone,
            notes,
            type: 'order-detail',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}

export function ProInvoicePdfButton({
  items,
  subtotal,
  ppn,
  total,
  totalWeight,
  logoBase64,
  proInvoiceNumber,
  proInvoiceDate,
  customerName,
  customerCompany,
  customerAddress,
  customerEmail,
  customerPhone,
  customerTaxId,
  notes,
  terms,
  disabled,
}: ProInvoicePdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            totalWeight,
            logoBase64,
            proInvoiceNumber,
            proInvoiceDate,
            customerName,
            customerCompany,
            customerAddress,
            customerEmail,
            customerPhone,
            customerTaxId,
            notes,
            terms,
            type: 'pro-invoice',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}

export function PurchaseOrderPdfButton({
  items,
  subtotal,
  ppn,
  total,
  logoBase64,
  poNumber,
  poDate,
  supplierName,
  supplierCompany,
  supplierAddress,
  supplierEmail,
  supplierPhone,
  supplierTaxId,
  deliveryAddress,
  deliveryDate,
  paymentTerms,
  notes,
  disabled,
}: PurchaseOrderPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const generatePdf = async () => {
    try {
      setIsLoading(true)
      // Generate PDF
      const pdfDoc = (
        <PdfDocument
          content={{
            items,
            subtotal,
            ppn,
            total,
            logoBase64,
            poNumber,
            poDate,
            supplierName,
            supplierCompany,
            supplierAddress,
            supplierEmail,
            supplierPhone,
            supplierTaxId,
            deliveryAddress,
            deliveryDate,
            paymentTerms,
            notes,
            type: 'purchase-order',
          }}
        />
      )

      // Create blob
      const blob = await pdf(pdfDoc).toBlob()
      const url = window.URL.createObjectURL(blob)
      return { blob, url }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url } = await generatePdf()

      // Open PDF in new tab/window for preview
      window.open(url, '_blank')

      // Clean up URL after a delay to allow the window to open
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      toast.error('Gagal membuka PDF. Silakan coba lagi.')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled || isLoading}
      onClick={handleDownload}>
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin' />
      ) : (
        <Download className='h-5 w-5' />
      )}
    </Button>
  )
}
