'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { checkMidtransTransaction } from '@/app/actions/midtransAction'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    if (!orderId) {
      setStatus('error')
      setMessage('Order ID tidak ditemukan')
      return
    }

    const checkStatus = async () => {
      try {
        const response = await checkMidtransTransaction(orderId)
        if (response.success) {
          setStatus('success')
          setMessage('Pembayaran berhasil!')
        } else {
          setStatus('error')
          setMessage(response.message || 'Terjadi kesalahan')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Terjadi kesalahan saat memeriksa status pembayaran')
      }
    }

    checkStatus()
  }, [searchParams])

  return (
    <div className='container max-w-2xl py-12'>
      <Card className='p-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          {status === 'loading' && (
            <>
              <Loader2 className='h-12 w-12 animate-spin text-primary' />
              <h1 className='text-2xl font-semibold'>
                Memeriksa Status Pembayaran
              </h1>
              <p className='text-muted-foreground'>Mohon tunggu sebentar...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className='h-12 w-12 text-green-500' />
              <h1 className='text-2xl font-semibold'>Pembayaran Berhasil!</h1>
              <p className='text-muted-foreground'>{message}</p>
              <div className='flex gap-4 pt-4'>
                <Button asChild variant='outline'>
                  <Link href='/orders'>Lihat Pesanan</Link>
                </Button>
                <Button asChild>
                  <Link href='/'>Kembali ke Beranda</Link>
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='rounded-full bg-red-100 p-3'>
                <svg
                  className='h-6 w-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-semibold'>Pembayaran Gagal</h1>
              <p className='text-muted-foreground'>{message}</p>
              <div className='flex gap-4 pt-4'>
                <Button asChild variant='outline'>
                  <Link href='/orders'>Lihat Pesanan</Link>
                </Button>
                <Button asChild>
                  <Link href='/'>Kembali ke Beranda</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
