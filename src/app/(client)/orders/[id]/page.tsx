'use client'

import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Package,
  Truck,
  Copy,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { clearCartAfterOrder } from '@/app/actions/cartAction'
import { useCartStore } from '@/hooks/zustandStore'
import { cn } from '@/lib/utils'
import { createNotification } from '@/app/actions/notificationAction'
import { refreshPaymentStatus } from '@/app/actions/midtransAction'

// Optimized components
import {
  OrderDetailSkeleton,
  OrderItems,
  PaymentInfo,
  OrderSummary,
  ShippingAddress,
  WebhookAlert,
} from './components'
import { useOrderData, type OrderData } from './hooks/useOrderData'

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderPage() {
  const router = useRouter()
  const param = useParams()
  const { fetchCart } = useCartStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Use custom hook for data fetching
  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useOrderData(param.id ? param.id.toString() : '')

  // Memoize derived values to prevent unnecessary re-renders
  const paymentStatus = useMemo(
    () => orderData?.payment?.status,
    [orderData?.payment?.status]
  )

  const isPaymentComplete = useMemo(
    () =>
      paymentStatus &&
      ['SUCCESS', 'FAILED', 'CANCELLED'].includes(paymentStatus),
    [paymentStatus]
  )

  // Memoize expensive calculations
  const orderSummary = useMemo(() => {
    if (!orderData?.payment?.order?.items)
      return { subtotal: 0, ppn: 0, total: 0 }

    const subtotal = orderData.payment.order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const ppn = Math.round(subtotal * 0.11)
    const total = subtotal + ppn

    return { subtotal, ppn, total }
  }, [orderData?.payment?.order?.items])

  // Memoize address display
  const formattedAddress = useMemo(() => {
    if (!orderData?.payment?.order?.address) return null
    const addr = orderData.payment.order.address
    return {
      recipientName: addr.recipientName,
      fullAddress: addr.address,
      cityPostal: `${addr.city}, ${addr.postalCode}`,
      ...addr,
    }
  }, [orderData?.payment?.order?.address])

  // Optimize refresh function with useCallback
  const handleForceRefresh = useCallback(async () => {
    if (!orderData?.payment?.order?.id) return

    setIsRefreshing(true)
    try {
      // Manual sync dengan Midtrans API jika webhook tidak bekerja
      const syncResult = await refreshPaymentStatus(orderData.payment.order.id)

      if (syncResult.success) {
        // Refresh query data setelah sync berhasil
        await refetch()
        toast.success('Status pembayaran berhasil diperbarui')
      } else {
        // Jika sync gagal, coba refresh data saja
        await refetch()
        toast.warning(
          'Data diperbarui, namun sync dengan Midtrans gagal: ' +
            syncResult.message
        )
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      // Fallback ke refresh data biasa
      try {
        await refetch()
        toast.info('Data diperbarui, namun tidak dapat sync dengan Midtrans')
      } catch (fallbackError) {
        toast.error('Gagal memperbarui data. Silakan coba lagi.')
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [orderData?.payment?.order?.id, refetch])

  // Optimize success payment handler
  const handleSuccessPayment = useCallback(async () => {
    if (!orderData?.payment) return

    const { payment } = orderData
    if (!payment || payment.status !== 'SUCCESS' || !payment.order?.id) return

    try {
      // Clear cart items that have been purchased
      await clearCartAfterOrder(payment.order.id)

      // Safely call fetchCart if it exists
      if (typeof fetchCart === 'function') {
        await fetchCart()
      }

      // Create notifications
      if (payment.order.userId) {
        await Promise.all([
          createNotification(
            payment.order.userId,
            'Pembayaran Terverifikasi',
            'Pembayaran kamu sudah kami terima. Terima kasih!',
            false
          ),
          createNotification(
            payment.order.userId,
            'Pesanan Dikonfirmasi',
            `Pesanan #${payment.order.id} telah dikonfirmasi dan sedang diproses.`,
            false
          ),
        ])
      }

      // Redirect to success page with transaction ID
      const transactionId = payment.transactionId
      if (transactionId) {
        router.push(`/payment/success?order_id=${transactionId}`)
      }
    } catch (error) {
      console.error('Error handling success payment:', error)
    }
  }, [orderData?.payment, router, fetchCart])

  // Effect for handling payment success
  useEffect(() => {
    if (paymentStatus === 'SUCCESS') {
      handleSuccessPayment()
    }
  }, [paymentStatus, handleSuccessPayment])

  // Early returns for loading and error states
  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (error || !orderData) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4'>
            <AlertCircle className='mx-auto h-8 w-8 text-destructive' />
          </div>
          <p className='text-gray-600'>
            {error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat memuat detail pesanan'}
          </p>
        </div>
      </div>
    )
  }

  const { payment, transaction } = orderData

  // Check if payment.order exists before accessing it
  if (!payment || !payment.order) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4'>
            <AlertCircle className='mx-auto h-8 w-8 text-destructive' />
          </div>
          <p className='text-gray-600'>
            Data pesanan tidak lengkap. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    )
  }

  const order = payment.order

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            href='/orders'
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            Kembali ke Daftar Pesanan
          </Link>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              Detail Pesanan
            </h1>
            <Button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              variant='outline'
              size='sm'
              className='flex items-center gap-2'>
              {isRefreshing ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <RefreshCw className='w-4 h-4' />
              )}
              {isRefreshing ? 'Memperbarui...' : 'Perbarui Status'}
            </Button>
          </div>
        </div>

        {/* Webhook Alert - tampilkan jika webhook tidak bekerja */}
        <WebhookAlert
          paymentStatus={payment.status}
          orderCreatedAt={order.createdAt}
          onRefresh={handleForceRefresh}
        />

        {/* Order Status */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='flex flex-col items-center text-center p-4'>
                <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2'>
                  <span className='text-green-600 font-bold'>1</span>
                </div>
                <span className='text-sm font-medium text-gray-900 min-w-[80px]'>
                  Pesanan Dibuat
                </span>
                <span className='text-xs text-gray-500 mt-1'>
                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>

              <div className='flex flex-col items-center text-center p-4'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mb-2',
                    payment.status === 'SUCCESS'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  )}>
                  <span
                    className={cn(
                      'font-bold',
                      payment.status === 'SUCCESS'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    )}>
                    2
                  </span>
                </div>
                <span className='text-sm font-medium text-gray-900 min-w-[80px]'>
                  Pembayaran
                </span>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full mt-1',
                    payment.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                  {payment.status}
                </span>
              </div>

              <div className='flex flex-col items-center text-center p-4'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mb-2',
                    order.status === 'CONFIRMED' ||
                      order.status === 'SHIPPED' ||
                      order.status === 'DELIVERED'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  )}>
                  <span
                    className={cn(
                      'font-bold',
                      order.status === 'CONFIRMED' ||
                        order.status === 'SHIPPED' ||
                        order.status === 'DELIVERED'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    )}>
                    3
                  </span>
                </div>
                <span className='text-sm font-medium text-gray-900 min-w-[80px]'>
                  Pesanan
                </span>
                <span className='text-xs text-gray-500 mt-1'>
                  {order.status}
                </span>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                  Order ID:
                </span>
                <span className='font-medium'>#{order.id.slice(-8)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                  Total:
                </span>
                <span className='font-bold text-lg text-primary'>
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            <OrderItems items={order.items} />
            <OrderSummary
              subtotal={orderSummary.subtotal}
              ppn={orderSummary.ppn}
              total={order.totalAmount}
            />
            <ShippingAddress address={formattedAddress} />
          </div>

          {/* Right Column - Payment Information */}
          <div className='lg:col-span-1'>
            <div className='sticky top-6'>
              <PaymentInfo
                payment={payment}
                transaction={transaction}
                onRefresh={handleForceRefresh}
                isRefreshing={isRefreshing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
