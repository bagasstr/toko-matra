'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { checkMidtransTransaction } from '@/app/actions/midtransAction'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessClient() {
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
    <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-6 md:p-8 shadow-lg'>
        <div className='flex flex-col items-center justify-center space-y-6 text-center'>
          {status === 'loading' && (
            <>
              <div className='rounded-full bg-primary/10 p-4'>
                <Loader2 className='h-12 w-12 animate-spin text-primary md:h-16 md:w-16' />
              </div>
              <div className='space-y-2'>
                <h1 className='text-2xl font-semibold md:text-3xl'>
                  Memeriksa Status Pembayaran
                </h1>
                <p className='text-muted-foreground text-sm md:text-base'>
                  Mohon tunggu sebentar...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className='rounded-full bg-green-100 p-4'>
                <CheckCircle2 className='h-12 w-12 text-green-500 md:h-16 md:w-16' />
              </div>
              <div className='space-y-2'>
                <h1 className='text-2xl font-semibold md:text-3xl'>
                  Pembayaran Berhasil!
                </h1>
                <p className='text-muted-foreground text-sm md:text-base'>
                  {message}
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto'>
                <Button asChild variant='outline' className='w-full sm:w-auto'>
                  <Link href='/orders'>Lihat Pesanan</Link>
                </Button>
                <Button asChild className='w-full sm:w-auto'>
                  <Link href='/'>Kembali ke Beranda</Link>
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='rounded-full bg-red-100 p-4'>
                <XCircle className='h-12 w-12 text-red-500 md:h-16 md:w-16' />
              </div>
              <div className='space-y-2'>
                <h1 className='text-2xl font-semibold md:text-3xl'>
                  Pembayaran Gagal
                </h1>
                <p className='text-muted-foreground text-sm md:text-base'>
                  {message}
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto'>
                <Button asChild variant='outline' className='w-full sm:w-auto'>
                  <Link href='/orders'>Lihat Pesanan</Link>
                </Button>
                <Button asChild className='w-full sm:w-auto'>
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
