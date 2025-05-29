'use client'

import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Package,
  Truck,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Payment } from '@/types/payment'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderPage() {
  const router = useRouter()
  const param = useParams()
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [transactionResult, setTransactionResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { fetchCart } = useCartStore()

  console.log(param)
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        // Fetch payment details
        const paymentRes = await getPaymentByOrderId(param.id as string)

        if (!paymentRes.success || !paymentRes.data) {
          setError(paymentRes.message || 'Gagal memuat detail pembayaran')
          setLoading(false)
          return
        }

        setPaymentResult(paymentRes.data)

        let transactionRes = null
        // Check transaction status if we have a transactionId
        if (paymentRes.data.transactionId) {
          transactionRes = await checkMidtransTransaction(
            paymentRes.data.transactionId
          )

          if (!transactionRes.success) {
            setError(
              transactionRes.message || 'Gagal memeriksa status transaksi'
            )
          } else {
            setTransactionResult(transactionRes.data)
          }
        }

        // Check if payment is successful based on transaction status
        const isPaymentSuccessful =
          paymentRes.data.status === 'SUCCESS' ||
          transactionRes?.data?.statusResponse?.data?.status === 'SETTLEMENT' ||
          transactionRes?.data?.statusResponse?.data?.status === 'SUCCESS'

        if (isPaymentSuccessful) {
          try {
            // Clear cart items for this order
            await clearCartAfterOrder(paymentRes.data.order.id)

            // Refresh cart state
            await fetchCart()

            // Show success toast
            toast.success('Pesanan berhasil dibayar dan keranjang diperbarui')

            // Redirect to success page
            router.replace(
              `/payment/success?order_id=${paymentRes.data.transactionId}`
            )
          } catch (clearError) {
            console.error('Error clearing cart:', clearError)
            toast.error('Gagal membersihkan keranjang')
          }
          return
        }

        setLoading(false)
      } catch (err) {
        setError('Terjadi kesalahan saat memuat halaman')
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [param.id, router, fetchCart])

  // Loading state
  if (loading) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <div className='text-center text-gray-600'>
          Memuat detail pesanan...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2'>
          <AlertCircle className='w-5 h-5' />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // If no payment result, show error
  if (!paymentResult) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <div className='bg-red-50 text-red-800 p-4 rounded-md'>
          Tidak dapat memuat detail pesanan
        </div>
      </div>
    )
  }

  const order = paymentResult.order
  const payment = paymentResult

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
                        <Image
                          src={
                            item.product.images[0] ||
                            '/placeholder.svg?height=80&width=80'
                          }
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className='object-cover rounded-lg bg-gray-100 border'
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
                      Rp{' '}
                      {(
                        order.subtotalAmount ??
                        order.items.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>PPN (11%)</span>
                    <span>
                      Rp{' '}
                      {Math.round(
                        (order.subtotalAmount ??
                          order.items.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          )) * 0.11
                      ).toLocaleString('id-ID')}
                    </span>
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
                <div className='space-y-2'>
                  <div className='font-semibold text-gray-900'>
                    {order.address.recipientName}
                  </div>
                  <div className='inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium'>
                    {order.address.labelAddress}
                  </div>
                  <div className='text-gray-700 leading-relaxed'>
                    <div>{order.address.address}</div>
                    <div>
                      {order.address.village}, {order.address.district}
                    </div>
                    <div>
                      {order.address.city}, {order.address.province}{' '}
                      {order.address.postalCode}
                    </div>
                  </div>
                </div>
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

                    {transactionResult?.statusResponse?.data?.status ===
                      'PENDING' &&
                      transactionResult.statusResponse.data.expiry_time && (
                        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                          <div className='text-sm font-medium text-red-800 mb-1'>
                            Batas Pembayaran:
                          </div>
                          <div className='text-sm font-semibold text-red-600'>
                            {new Date(
                              transactionResult.statusResponse.data.expiry_time
                            ).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  {payment.status === 'PENDING' && (
                    <div className='pt-4 border-t'>
                      <ButtonCancelTrx
                        transactionId={
                          transactionResult?.statusResponse?.data?.order_id
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
