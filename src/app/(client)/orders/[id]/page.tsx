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
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Payment } from '@/types/payment'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import {
  checkMidtransTransaction,
  getPaymentByOrderId,
} from '@/app/actions/midtransAction'
import { toast } from 'sonner'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { ButtonCopy, ButtonCancelTrx } from '@/components/ButtonCopy'
import { clearCartAfterOrder } from '@/app/actions/cartAction'
import { useCartStore } from '@/hooks/zustandStore'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createNotification } from '@/app/actions/notificationAction'
import OptimizedImage from '@/components/OptimizedImage'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderPageProps {
  params: {
    id: string
  }
}

interface CountdownProps {
  expiryTime: string
}

function CountdownTimer({ expiryTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiryTime).getTime()
      const now = new Date().getTime()
      const difference = expiry - now

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    }

    // Update immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [expiryTime])

  return (
    <div className='flex items-center gap-2 text-sm text-red-600'>
      <Clock className='h-4 w-4' />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

interface OrderData {
  payment: {
    id: string
    status: string
    amount: number
    paymentMethod: string
    bank?: string
    vaNumber?: string
    transactionId?: string
    order: {
      id: string
      status: string
      totalAmount: number
      createdAt: string
      userId: string
      items: {
        id: string
        quantity: number
        price: number
        product: {
          name: string
          images: string[]
        }
      }[]
      address: {
        recipientName: string
        labelAddress: string
        address: string
        city: string
        postalCode: string
      }
    }
  }
  transaction?: {
    statusResponse?: {
      data?: {
        status: string
        order_id?: string
        expiry_time?: string
      }
    }
  }
}

// Loading skeleton component
function OrderDetailSkeleton() {
  return (
    <div className='max-w-6xl mx-auto px-4 py-8 space-y-6'>
      <Skeleton className='h-6 w-48' />
      <Skeleton className='h-8 w-64' />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column skeleton */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <Skeleton className='h-16 w-16' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-4 w-20' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column skeleton */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OrderPage() {
  const router = useRouter()
  const param = useParams()
  const { fetchCart } = useCartStore()

  // Optimized query with conditional refetching
  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderData, Error>({
    queryKey: ['orderDetails', param.id],
    queryFn: async () => {
      const paymentRes = await getPaymentByOrderId(param.id.toString())

      if (!paymentRes.success || !paymentRes.data) {
        throw new Error(paymentRes.message || 'Gagal memuat detail pembayaran')
      }

      let transactionRes = null
      if (paymentRes.data.transactionId) {
        transactionRes = await checkMidtransTransaction(
          paymentRes.data.transactionId
        )

        if (!transactionRes.success) {
          console.warn('Transaction check failed:', transactionRes.message)
          // Don't throw error for transaction check, continue without it
        }
      }

      return {
        payment: paymentRes.data,
        transaction: transactionRes?.data,
      }
    },
    // Optimized refetch logic - only refetch when payment is pending
    refetchInterval: (query) => {
      // Stop refetching if payment is success, failed, or cancelled
      const data = query.state.data
      if (
        data?.payment?.status &&
        ['SUCCESS', 'FAILED', 'CANCELLED'].includes(data.payment.status)
      ) {
        return false
      }
      // Refetch every 10 seconds (reduced from 5 seconds) for pending payments
      return 10000
    },
    refetchOnWindowFocus: false, // Reduced unnecessary refetching
    refetchOnMount: true,
    refetchIntervalInBackground: false, // Don't refetch in background
    // Cache for 2 minutes
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // Memoize derived values
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
    }
  }, [orderData?.payment?.order?.address])

  useEffect(() => {
    const handleSuccessPayment = async () => {
      if (orderData?.payment?.status === 'SUCCESS') {
        try {
          // Clear cart items that have been purchased
          await clearCartAfterOrder(orderData.payment.order.id)
          // Refresh cart data in the store
          await fetchCart()

          // Create notifications
          await createNotification(
            orderData.payment.order.userId,
            'Pembayaran Terverifikasi',
            'Pembayaran kamu sudah kami terima. Terima kasih!',
            false
          )

          await createNotification(
            orderData.payment.order.userId,
            'Pesanan Dikonfirmasi',
            `Pesanan #${orderData.payment.order.id} telah dikonfirmasi dan sedang diproses.`,
            false
          )

          // Redirect to success page with transaction ID
          const transactionId = orderData.payment.transactionId
          if (transactionId) {
            router.push(`/payment/success?order_id=${transactionId}`)
          }
        } catch (error) {
          console.error('Error handling success payment:', error)
        }
      }
    }

    // Only run when payment becomes successful
    if (orderData?.payment?.status === 'SUCCESS') {
      handleSuccessPayment()
    }
  }, [
    orderData?.payment?.status,
    orderData?.payment?.order.id,
    orderData?.payment?.order.userId,
    orderData?.payment?.transactionId,
    router,
    fetchCart,
  ])

  // Add effect to monitor order status changes
  useEffect(() => {
    const previousStatus = orderData?.payment?.order?.status
    const currentStatus = orderData?.payment?.order?.status

    if (
      previousStatus !== currentStatus &&
      currentStatus &&
      orderData?.payment?.order?.userId
    ) {
      const createStatusNotification = async () => {
        let title = ''
        let message = ''

        switch (currentStatus) {
          case 'CONFIRMED':
            title = 'Pesanan Diproses'
            message = `Pesanan #${orderData.payment.order.id} sedang diproses oleh tim kami.`
            break
          case 'SHIPPED':
            title = 'Pesanan Dikirim'
            message = `Pesanan #${orderData.payment.order.id} sedang dalam perjalanan.`
            break
          case 'DELIVERED':
            title = 'Pesanan Selesai'
            message = `Pesanan #${orderData.payment.order.id} telah selesai. Terima kasih telah berbelanja!`
            break
          case 'CANCELLED':
            title = 'Pesanan Dibatalkan'
            message = `Pesanan #${orderData.payment.order.id} telah dibatalkan.`
            break
        }

        if (title && message) {
          try {
            await createNotification(
              orderData.payment.order.userId,
              title,
              message,
              false
            )
          } catch (error) {
            console.error('Error creating status notification:', error)
          }
        }
      }

      createStatusNotification()
    }
  }, [orderData?.payment?.order?.status])

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
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Detail Pesanan
          </h1>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pesanan</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1'>
                      <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                        Order ID:
                      </span>
                      <span className='font-semibold'>{order.id}</span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1'>
                      <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                        Status:
                      </span>
                      <span
                        className={cn(
                          'inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          order.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1'>
                      <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                        Tanggal:
                      </span>
                      <span className='font-semibold'>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1'>
                      <span className='text-sm font-medium text-gray-500 min-w-[80px]'>
                        Total:
                      </span>
                      <span className='font-bold text-lg text-primary'>
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Item Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {order.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row gap-4 ${
                        index !== order.items.length - 1
                          ? 'border-b border-gray-200 pb-4'
                          : ''
                      }`}>
                      <div className='flex-shrink-0'>
                        <OptimizedImage
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className='object-cover rounded-lg bg-gray-100 border'
                          priority={index < 3}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          {item.product.name}
                        </h4>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                          <div className='text-sm text-gray-600'>
                            {item.quantity} x Rp{' '}
                            {item.price.toLocaleString('id-ID')}
                          </div>
                          <div className='font-bold text-lg'>
                            Rp{' '}
                            {(item.price * item.quantity).toLocaleString(
                              'id-ID'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary with PPN */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span>
                      Rp {orderSummary.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>PPN (11%)</span>
                    <span>Rp {orderSummary.ppn.toLocaleString('id-ID')}</span>
                  </div>
                  <div className='flex justify-between border-t pt-3 font-bold'>
                    <span>Total</span>
                    <span className='text-primary'>
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Alamat Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                {formattedAddress ? (
                  <div className='space-y-2'>
                    <div className='font-semibold text-gray-900'>
                      {formattedAddress.recipientName}
                    </div>
                    <div className='text-gray-700 leading-relaxed'>
                      <div>{formattedAddress.fullAddress}</div>
                      <div>{formattedAddress.cityPostal}</div>
                    </div>
                  </div>
                ) : (
                  <div className='text-gray-500'>Alamat tidak tersedia</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Payment Information */}
          <div className='lg:col-span-1'>
            <div className='sticky top-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-500'>
                        Status:
                      </span>
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
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-500'>
                        Metode:
                      </span>
                      <span className='font-medium text-right'>
                        {payment.paymentMethod === 'bank_transfer'
                          ? 'Transfer Bank VA'
                          : ''}
                      </span>
                    </div>

                    {payment.bank && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm font-medium text-gray-500'>
                          Bank:
                        </span>
                        <span className='font-medium uppercase'>
                          {payment.bank}
                        </span>
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

                    {payment.status === 'PENDING' && (
                      <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                        <div className='text-sm font-medium text-red-800 mb-1'>
                          Batas Pembayaran:
                        </div>
                        <div className='text-sm font-semibold text-red-600 mb-2'>
                          {transaction?.statusResponse?.data.expiry_time &&
                            new Date(
                              transaction.statusResponse.data.expiry_time
                            ).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                        </div>
                        {transaction?.statusResponse?.data.expiry_time && (
                          <CountdownTimer
                            expiryTime={
                              transaction.statusResponse.data.expiry_time
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {payment.status === 'PENDING' && (
                    <div className='pt-4 border-t'>
                      <ButtonCancelTrx
                        transactionId={
                          transaction?.statusResponse?.data?.order_id
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
