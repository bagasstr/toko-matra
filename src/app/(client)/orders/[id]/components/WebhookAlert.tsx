import { memo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WebhookAlertProps {
  paymentStatus: string
  orderCreatedAt: string
  onRefresh: () => Promise<void>
}

export const WebhookAlert = memo(
  ({ paymentStatus, orderCreatedAt, onRefresh }: WebhookAlertProps) => {
    // Hitung berapa lama order sudah dibuat (dalam menit)
    const minutesSinceCreated = Math.floor(
      (new Date().getTime() - new Date(orderCreatedAt).getTime()) / (1000 * 60)
    )

    // Tampilkan alert jika:
    // 1. Status masih PENDING
    // 2. Sudah lebih dari 10 menit sejak order dibuat
    const shouldShowAlert =
      paymentStatus === 'PENDING' && minutesSinceCreated > 10

    if (!shouldShowAlert) return null

    return (
      <Alert className='border-amber-200 bg-amber-50'>
        <AlertTriangle className='h-4 w-4 text-amber-600' />
        <AlertDescription className='text-amber-800'>
          <div className='space-y-2'>
            <p className='font-medium'>
              Status pembayaran belum terupdate otomatis
            </p>
            <p className='text-sm'>
              Jika Anda sudah melakukan pembayaran lebih dari 10 menit yang
              lalu, gunakan tombol "Periksa Status Pembayaran" untuk memperbarui
              status secara manual.
            </p>
            <button
              onClick={onRefresh}
              className='inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 underline'>
              <RefreshCw className='w-3 h-3' />
              Periksa Status Sekarang
            </button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }
)

WebhookAlert.displayName = 'WebhookAlert'
