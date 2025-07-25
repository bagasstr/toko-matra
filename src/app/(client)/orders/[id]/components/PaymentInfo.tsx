import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonCopy, ButtonCancelTrx } from '@/components/ButtonCopy'
import { cn } from '@/lib/utils'
import { CountdownTimer } from './CountdownTimer'
import { RefreshCw, Loader2 } from 'lucide-react'

interface PaymentData {
  id: string
  status: string
  amount: number
  paymentMethod: string
  bank?: string
  vaNumber?: string
  transactionId?: string
  rawResponse?: any
  order: {
    createdAt: string
  }
}

interface PaymentInfoProps {
  payment: PaymentData
  transaction?: any
  onRefresh?: () => Promise<void>
  isRefreshing?: boolean
}

export const PaymentInfo = memo(
  ({
    payment,
    transaction,
    onRefresh,
    isRefreshing = false,
  }: PaymentInfoProps) => {
    // Safely check if payment exists
    if (!payment) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center text-gray-500'>
              Data pembayaran tidak tersedia
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-500'>Status:</span>
              <div className='text-right'>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    payment.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                  {payment.status}
                </span>
                {payment.status === 'PENDING' && (
                  <div className='text-xs text-gray-500 mt-1'>
                    Status update otomatis
                  </div>
                )}
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-500'>Metode:</span>
              <span className='font-medium text-right'>
                {payment.paymentMethod === 'bank_transfer'
                  ? 'Transfer Bank VA'
                  : payment.paymentMethod}
              </span>
            </div>

            {payment.bank && (
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-gray-500'>Bank:</span>
                <span className='font-medium uppercase'>{payment.bank}</span>
              </div>
            )}

            {payment.vaNumber && (
              <div className='flex flex-col gap-1'>
                <span className='text-sm font-medium text-gray-500'>
                  Nomor VA:
                </span>
                <div className='bg-gray-50 p-3 rounded-lg border relative group'>
                  <code className='text-sm font-mono break-all'>
                    {payment.vaNumber}
                  </code>
                  <ButtonCopy text={payment.vaNumber} />
                </div>
              </div>
            )}

            <div className='border-t pt-3'>
              <div className='flex justify-between items-center border-t pt-2 mt-2'>
                <span className='text-base font-bold'>Total:</span>
                <span className='text-lg font-bold text-primary'>
                  Rp {payment.amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {payment.status === 'PENDING' &&
              payment.order?.createdAt &&
              (() => {
                // Try to get expiry time from different sources
                const expiryTime =
                  transaction?.statusResponse?.data?.expiry_time ||
                  transaction?.statusResponse?.expiry_time ||
                  payment?.rawResponse?.expiry_time ||
                  // Fallback: 24 hours from creation
                  new Date(
                    new Date(payment.order.createdAt).getTime() +
                      24 * 60 * 60 * 1000
                  ).toISOString()

                return (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <div className='text-sm font-medium text-red-800 mb-1'>
                      Batas Pembayaran:
                    </div>
                    <div className='text-sm font-semibold text-red-600 mb-2'>
                      {new Date(expiryTime).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                    <CountdownTimer expiryTime={expiryTime} />
                    <div className='text-xs text-red-600 mt-2 opacity-80'>
                      Status akan terupdate otomatis setelah pembayaran
                    </div>
                    {onRefresh && (
                      <div className='mt-3 pt-2 border-t border-red-200'>
                        <Button
                          onClick={onRefresh}
                          disabled={isRefreshing}
                          variant='outline'
                          size='sm'
                          className='w-full flex items-center gap-2 text-red-700 border-red-300 hover:bg-red-50'>
                          {isRefreshing ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <RefreshCw className='w-4 h-4' />
                          )}
                          {isRefreshing
                            ? 'Memeriksa...'
                            : 'Periksa Status Pembayaran'}
                        </Button>
                        <div className='text-xs text-red-600 mt-1 text-center opacity-70'>
                          Gunakan jika status tidak update otomatis
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
          </div>

          {payment.status === 'PENDING' && payment.transactionId && (
            <div className='pt-4 border-t'>
              <ButtonCancelTrx
                transactionId={
                  payment.transactionId ||
                  transaction?.statusResponse?.data?.order_id
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

PaymentInfo.displayName = 'PaymentInfo'
