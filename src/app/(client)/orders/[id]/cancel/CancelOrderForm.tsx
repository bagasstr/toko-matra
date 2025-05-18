'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { cancelOrder } from '@/app/actions/orderAction'
import { useRouter } from 'next/navigation'

interface CancelOrderFormProps {
  orderId: string
}

export default function CancelOrderForm({ orderId }: CancelOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCancel = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await cancelOrder(orderId)

      if (result.success) {
        // Redirect to order detail page with success message
        router.push(`/orders/${orderId}?cancelled=true`)
      } else {
        setError(result.message || 'Gagal membatalkan pesanan')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      setError('Terjadi kesalahan saat membatalkan pesanan')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='rounded-lg border shadow-sm p-6'>
      <h2 className='text-lg font-semibold mb-4'>Konfirmasi Pembatalan</h2>

      {error && (
        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>{error}</p>
        </div>
      )}

      <p className='mb-6 text-gray-600'>
        Dengan membatalkan pesanan ini, semua item dalam pesanan akan
        dikembalikan ke stok dan pembayaran yang telah dilakukan (jika ada) akan
        diproses untuk pengembalian dana sesuai dengan kebijakan kami.
      </p>

      <div className='flex gap-4'>
        <Button
          variant='outline'
          onClick={() => router.back()}
          disabled={isSubmitting}>
          Kembali
        </Button>

        <Button
          variant='destructive'
          onClick={handleCancel}
          disabled={isSubmitting}>
          {isSubmitting ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
        </Button>
      </div>
    </div>
  )
}
