import { getOrderById } from '@/app/actions/orderAction'
import {
  checkMidtransTransaction,
  getPaymentByOrderId,
} from '@/app/actions/midtransAction'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import CopyButton from '@/app/(client)/components/CopyButton'
import { PdfFakturButton } from '@/app/(client)/components/DownloadPdfButton'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string } & Promise<any>
}) {
  const id = params.id

  // Get order details
  const orderResult = await getOrderById(id)

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
  console.log(order)

  // Load logo directly in server component
  let logoBase64 = ''
  try {
    const { getCompanyLogoBase64 } = await import('@/lib/utils')
    logoBase64 = await getCompanyLogoBase64()
  } catch (error) {
    console.error('Failed to load logo:', error)
  }

  // Jika status PENDING, ambil detail pembayaran
  let paymentDetail = null
  let paymentStatus = order.status
  if (order.status === 'PENDING') {
    const paymentRes = await getPaymentByOrderId(order.id)
    if (paymentRes.success && paymentRes.data) {
      paymentDetail = paymentRes.data
      // Cek status Midtrans jika ada transactionId
      if (paymentDetail.transactionId) {
        const midtransStatusRes = await checkMidtransTransaction(
          paymentDetail.transactionId
        )
        if (midtransStatusRes.success && midtransStatusRes.data) {
          paymentStatus = midtransStatusRes.data.order_status || order.status
        }
      }
    }
  }

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
          <div className='lg:col-span-2 space-y-6 lg:w-[98%]'>
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pesanan</CardTitle>
              </CardHeader>
              <CardContent className='space-y-8 w-full'>
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
                          paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : paymentStatus === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : paymentStatus === 'SHIPPED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : paymentStatus === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {paymentStatus === 'PENDING'
                          ? 'Menunggu Pembayaran'
                          : paymentStatus === 'CONFIRMED'
                          ? 'Diproses'
                          : paymentStatus === 'SHIPPED'
                          ? 'Dikirim'
                          : paymentStatus === 'DELIVERED'
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
                <div className='w-full flex justify-end'>
                  <PdfFakturButton
                    items={order.items.map((item: any) => ({
                      product: {
                        name: item.product.name,
                        price: item.price,
                        unit: item.product.unit || 'pcs',
                        sku: item.product.sku,
                        priceExclPPN: item.price,
                      },
                      quantity: item.quantity,
                    }))}
                    subtotal={order.subtotalAmount}
                    ppn={Math.round(order.subtotalAmount * 0.11)}
                    total={order.totalAmount}
                    logoBase64={logoBase64}
                    customerName={order.user?.profile?.fullName || '-'}
                    customerCompany={order.user?.profile?.companyName || '-'}
                    customerAddress={`${order.address?.address || '-'}, ${
                      order.address?.city || '-'
                    }, ${order.address?.province || '-'} ${
                      order.address?.postalCode || ''
                    }`}
                    customerEmail={order.user?.profile?.email || '-'}
                    customerPhone={order.user?.profile?.phoneNumber || '-'}
                    disabled={false}
                  />
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
          <div className='space-y-6 lg:justify-self-end'>
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h3 className='font-medium text-gray-900'>
                    {order.shipment?.map((shipment: any) => shipment.status)}
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
                  {paymentStatus === 'PENDING' && paymentDetail && (
                    <div className='space-y-3 p-4 rounded-lg border border-yellow-300 bg-yellow-50'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='font-bold text-yellow-800'>
                          Menunggu Pembayaran
                        </span>
                        <span className='text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded'>
                          Segera lakukan pembayaran
                        </span>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-start flex-col  gap-2'>
                          <span className='font-medium'>
                            Metode:{' '}
                            {paymentDetail.paymentType
                              .replace(/_/g, ' ')
                              .toLowerCase() || '-'}
                          </span>{' '}
                          <span className='text-base'>
                            Bank:{' '}
                            <b>{paymentDetail.bank?.toUpperCase() || '-'}</b>
                          </span>
                        </div>
                        {paymentDetail.vaNumber && (
                          <div>
                            <span className='font-medium'>
                              Virtual Account:
                            </span>{' '}
                            <div className='flex items-center gap-2 mt-1 w-fit'>
                              <span className='px-2 py-1 bg-white border rounded font-mono tracking-wider text-base'>
                                {paymentDetail.vaNumber}
                              </span>
                              <CopyButton value={paymentDetail.vaNumber} />
                            </div>
                          </div>
                        )}
                        {paymentDetail.redirect_url && (
                          <div>
                            <a
                              href={paymentDetail.redirect_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-semibold'>
                              Bayar Sekarang via Midtrans
                            </a>
                          </div>
                        )}
                        <div className='text-xs text-gray-600 mt-2'>
                          Setelah melakukan pembayaran, status pesanan akan
                          otomatis diperbarui.
                          <br />
                          Jika sudah membayar namun status belum berubah,
                          silakan refresh halaman ini.
                        </div>
                      </div>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium'>
                      Rp {Number(order.subtotalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>PPN (11%)</span>
                    <span className='font-medium'>
                      Rp{' '}
                      {Number(order.subtotalAmount * 0.11).toLocaleString(
                        'id-ID'
                      )}
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
