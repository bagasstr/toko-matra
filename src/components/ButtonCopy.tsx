'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cancelMidtransTransaction } from '@/app/actions/midtransAction'

interface ButtonCopyProps {
  text: string
}

export function ButtonCopy({ text }: ButtonCopyProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Berhasil menyalin nomor VA')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className='absolute right-1 top-1 h-8 w-8'
      onClick={handleCopy}>
      {copied ? (
        <Check className='h-4 w-4 text-green-600' />
      ) : (
        <Copy className='h-4 w-4' />
      )}
    </Button>
  )
}

interface ButtonCancelTrxProps {
  transactionId: string
}

export function ButtonCancelTrx({ transactionId }: ButtonCancelTrxProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!transactionId) {
    return null
  }

  const handleCancel = async () => {
    try {
      setIsLoading(true)
      const result = await cancelMidtransTransaction(transactionId)

      if (result.success) {
        toast.success('Transaksi berhasil dibatalkan')
        // Refresh halaman setelah pembatalan berhasil
        window.location.reload()
      } else {
        toast.error(result.message || 'Gagal membatalkan transaksi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat membatalkan transaksi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant='outline'
      className='w-full'
      onClick={handleCancel}
      disabled={isLoading}>
      {isLoading ? 'Membatalkan...' : 'Batalkan Pesanan'}
    </Button>
  )
}
