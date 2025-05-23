'use client'

import { generatePdfFromHtml } from '@/app/actions/pdfAction'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import React from 'react'
import { createProformaInvoiceFromCart } from '@/app/actions/proinvoiceAction'
import { toast } from 'sonner'

type CartButtonProps = {
  htmlContent: string
  disabled?: boolean
}

type ProInvoiceButtonProps = {
  htmlContent: string
  disabled?: boolean
  data: {
    cartItems: {
      product: {
        id: string
        price: number
        unit: string
      }
      quantity: number
    }[]
    customerData: {
      name: string
      address: string
      companyName?: string
      phone?: string
      email?: string
    }
    notes?: string
  }
}

export function PdfCartButton({ htmlContent, disabled }: CartButtonProps) {
  const handleDownload = async () => {
    const res = await generatePdfFromHtml(htmlContent)
    const blob = new Blob([res], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'daftar-keranjang.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled}
      onClick={handleDownload}>
      <Download className='h-5 w-5' />
    </Button>
  )
}

export function PdfProInvoiceButton({
  htmlContent,
  disabled,
  data,
}: ProInvoiceButtonProps) {
  const handleDownload = async () => {
    try {
      // Save download data first
      const saveResult = await createProformaInvoiceFromCart(
        data.cartItems,
        data.customerData,
        data.notes
      )
      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }

      // Generate and download PDF
      const res = await generatePdfFromHtml(htmlContent)
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'invoice.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Proforma invoice downloaded successfully')
    } catch (error) {
      console.error('Error downloading proforma invoice:', error)
      toast.error('Failed to download proforma invoice')
    }
  }

  return (
    <Button
      variant='outline'
      size='icon'
      disabled={disabled}
      onClick={handleDownload}>
      <Download className='h-5 w-5' />
    </Button>
  )
}
