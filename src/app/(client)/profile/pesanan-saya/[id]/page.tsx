import { getOrderById } from '@/app/actions/orderAction'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id

  // Get order details
  const orderResult = await getOrderById(id)
  console.log('Order Result:', orderResult)

  if (!orderResult.success || !orderResult.data) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2'>
          <AlertCircle className='w-5 h-5' />
          <p>{orderResult.message || 'Gagal memuat detail pesanan'}</p>
        </div>
      </div>
    )
  }

  const order = orderResult.data

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-6 pb-16 px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            href='/profile/pesanan-saya'
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'SHIPPED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {order.status === 'PENDING'
                          ? 'Menunggu Pembayaran'
                          : order.status === 'CONFIRMED'
                          ? 'Diproses'
                          : order.status === 'SHIPPED'
                          ? 'Dikirim'
                          : order.status === 'DELIVERED'
                          ? 'Diterima'
                          : 'Dibatalkan'}
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
                      <span className='font-semibold'>
                        Rp {Number(order.totalAmount).toLocaleString('id-ID')}
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
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className='flex items-start gap-4 p-4 border rounded-lg'>
                      <div className='w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0'>
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          sizes='80px'
                          className='object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-gray-900 truncate'>
                          {item.product.name}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {item.quantity} x Rp{' '}
                          {Number(item.price).toLocaleString('id-ID')}
                        </p>
                        <p className='text-sm font-medium text-gray-900 mt-1'>
                          Rp{' '}
                          {Number(item.price * item.quantity).toLocaleString(
                            'id-ID'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h3 className='font-medium text-gray-900'>
                    {order.Shipment.status}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {order.address.address}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {order.address.city}, {order.address.province}{' '}
                    {order.address.postalCode}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {order.user.profile.phoneNumber}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Total</span>
                    <span className='font-medium'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
