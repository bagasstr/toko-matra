import { getOrderById } from '@/app/actions/orderAction'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Package,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Payment } from '@/types/payment'
import { validateSession } from '@/app/actions/session'

export const dynamic = 'force-dynamic'

interface OrderPageProps {
  params: {
    id: string
  }
  searchParams: {
    success?: string
  }
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const orderId = params.id
  const isSuccess = searchParams.success === 'true'
  const session = await validateSession()
  const userId = session?.user?.profile.id.toLowerCase()

  const orderResult = await getOrderById(orderId)
  const order = orderResult.success ? orderResult.data : null

  if (!order) {
    return (
      <div className='max-w-3xl mx-auto py-10 px-4'>
        <div className='flex items-center gap-2 mb-6'>
          <Link href='/orders'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Kembali ke Pesanan
            </Button>
          </Link>
        </div>

        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>
            Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan
            ini.
          </p>
        </div>

        <Link href='/produk'>
          <Button>Lihat Produk</Button>
        </Link>
      </div>
    )
  }

  const payment = order.Payment[0] as Payment
  const shipment = order.Shipment
  const address = order.address

  return (
    <div className='max-w-3xl mx-auto py-10 px-4'>
      {isSuccess && (
        <div className='bg-green-50 text-green-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <CheckCircle2 className='w-5 h-5' />
          <p>
            Pesanan berhasil dibuat! Silakan lakukan pembayaran sesuai
            instruksi.
          </p>
        </div>
      )}

      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Detail Pesanan</h1>
        <div className='text-sm text-gray-500'>
          ID Pesanan: <span className='font-medium'>{order.id}</span>
        </div>
      </div>

      {/* Order Status */}
      <div className='rounded-lg border shadow-sm p-6 mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>Status Pesanan</h2>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : order.status === 'PROCESSING'
                ? 'bg-blue-100 text-blue-800'
                : order.status === 'SHIPPED'
                ? 'bg-indigo-100 text-indigo-800'
                : order.status === 'DELIVERED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
            {order.status === 'PENDING'
              ? 'Menunggu Pembayaran'
              : order.status === 'PROCESSING'
              ? 'Diproses'
              : order.status === 'SHIPPED'
              ? 'Dikirim'
              : order.status === 'DELIVERED'
              ? 'Diterima'
              : 'Dibatalkan'}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
          <div>
            <div className='text-sm text-gray-500 mb-1'>Tanggal Pesanan</div>
            <div>
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          <div>
            <div className='text-sm text-gray-500 mb-1'>Metode Pembayaran</div>
            <div className='capitalize'>
              {payment.paymentMethod.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t'>
          <div className='flex items-center gap-2 text-blue-600'>
            {order.status === 'PENDING' ? (
              <Package className='w-5 h-5' />
            ) : (
              <Truck className='w-5 h-5' />
            )}
            <div>
              {order.status === 'PENDING'
                ? 'Silakan lakukan pembayaran untuk memproses pesanan Anda'
                : order.status === 'PROCESSING'
                ? 'Pesanan Anda sedang diproses dan akan segera dikirim'
                : order.status === 'SHIPPED'
                ? `Pesanan Anda sedang dalam pengiriman ${
                    shipment.trackingNumber
                      ? `dengan nomor resi ${shipment.trackingNumber}`
                      : ''
                  }`
                : order.status === 'DELIVERED'
                ? 'Pesanan Anda telah diterima'
                : 'Pesanan Anda telah dibatalkan'}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className='rounded-lg border shadow-sm p-6 mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Produk</h2>

        <div className='space-y-4'>
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className='flex gap-4 items-center border-b pb-4'>
              <Image
                src={item.product.images[0] || '/placeholder.png'}
                alt={item.product.name}
                width={64}
                height={64}
                className='object-contain rounded bg-gray-50'
              />
              <div className='flex-1'>
                <div className='font-semibold text-base mb-1'>
                  {item.product.name}
                </div>
                <div className='text-gray-500 text-sm'>
                  {item.quantity} x Rp{' '}
                  {Number(item.price).toLocaleString('id-ID')}
                </div>
              </div>
              <div className='text-right font-bold'>
                Rp{' '}
                {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>Subtotal</span>
            <span className='font-medium'>
              Rp {Number(order.totalAmount).toLocaleString('id-ID')}
            </span>
          </div>
          <div className='flex justify-between border-t pt-2 mt-2'>
            <span className='font-bold'>Total</span>
            <span className='font-bold text-primary text-lg'>
              Rp {Number(order.totalAmount).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className='rounded-lg border shadow-sm p-6 mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Alamat Pengiriman</h2>

        <div>
          <div className='font-medium'>{address.recipientName}</div>
          <div className='text-gray-600 mt-1'>{address.address}</div>
          <div className='text-gray-600'>
            {address.village}, {address.district}, {address.city},{' '}
            {address.province} {address.postalCode}
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {order.status === 'PENDING' && payment && (
        <div className='rounded-lg border shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Instruksi Pembayaran</h2>

          <div className='bg-blue-50 p-4 rounded-md'>
            {payment.paymentMethod === 'bank_transfer' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Silakan transfer ke rekening berikut:
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Bank</span>
                    <span className='font-semibold'>
                      {payment.paymentDetails?.bank?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>No. Rekening</span>
                    <span className='font-semibold'>
                      {payment.paymentDetails?.vaNumber}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Atas Nama</span>
                    <span className='font-semibold'>
                      PT Bahan Bangunan Indonesia
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      payment.paymentDetails?.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {payment.paymentMethod === 'virtual_account' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Silakan transfer ke Virtual Account berikut:
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Bank</span>
                    <span className='font-semibold'>
                      {payment.paymentDetails?.bank?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>No. Virtual Account</span>
                    <span className='font-semibold'>
                      {payment.paymentDetails?.vaNumber}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      payment.paymentDetails?.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {payment.paymentMethod === 'e_wallet' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Pembayaran E-Wallet
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Metode</span>
                    <span className='font-semibold'>
                      {payment.paymentDetails?.eWalletType?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                {payment.midtransRedirectUrl && (
                  <div className='mt-4'>
                    <a
                      href={payment.midtransRedirectUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'>
                      Lanjutkan ke Pembayaran
                    </a>
                  </div>
                )}
                <div className='bg-yellow-50 p-3 rounded-md mt-4'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      payment.paymentDetails?.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {payment.paymentMethod === 'cod' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Pembayaran di Tempat (COD)
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      Total yang harus dibayar
                    </span>
                    <span className='font-semibold text-primary'>
                      Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Silakan siapkan pembayaran tunai saat barang diterima
                  </p>
                </div>
              </>
            )}

            <div className='mt-4 text-sm text-gray-600'>
              <p className='mb-2'>Catatan Penting:</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>Pastikan jumlah transfer sesuai dengan total pembayaran</li>
                <li>Simpan bukti pembayaran Anda</li>
                <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                <li>Jika ada kendala, silakan hubungi customer service kami</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between'>
        <Link
          href={{
            pathname: '/profile/pesanan-saya',
            query: {
              user: userId,
            },
          }}>
          <Button variant='outline'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Lihat Semua Pesanan
          </Button>
        </Link>

        {order.status === 'PENDING' && (
          <Link href={`/orders/${order.id}/cancel`}>
            <Button
              variant='ghost'
              className='text-red-600 hover:text-red-700 hover:bg-red-50'>
              Batalkan Pesanan
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
