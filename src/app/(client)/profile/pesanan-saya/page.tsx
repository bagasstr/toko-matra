import { getUserOrders } from '@/app/actions/orderAction'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import AuthSection from '@/components/ui/AuthSection'
import { validateSession } from '@/app/actions/session'

export default async function PesananSayaPage() {
  let orderResult = { success: false, data: [] as any[] }
  const result = await getUserOrders()
  orderResult = { success: result.success, data: result.data || [] }
  const orders = orderResult.success ? orderResult.data : []

  if (!orderResult.success) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <h1 className='text-2xl font-bold mb-6'>Pesanan Saya</h1>

        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>Terjadi kesalahan saat memuat data pesanan.</p>
        </div>

        <Link href='/produk'>
          <Button>Lihat Produk</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className='text-center py-16 border rounded-lg'>
          <div className='flex justify-center mb-4'>
            <ShoppingBag className='w-16 h-16 text-gray-300' />
          </div>
          <h2 className='text-xl font-medium mb-2'>Belum ada pesanan</h2>
          <p className='text-gray-500 mb-6'>
            Anda belum memiliki pesanan apapun
          </p>
          <Link href='/produk'>
            <Button>Mulai Belanja</Button>
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map((order: any) => (
            <div key={order.id} className='border rounded-lg overflow-hidden'>
              {/* Order Header */}
              <div className='bg-gray-50 p-4 flex flex-col md:flex-row justify-between gap-4'>
                <div>
                  <div className='text-sm text-gray-500'>ID Pesanan</div>
                  <div className='font-medium'>{order.id}</div>
                </div>

                <div>
                  <div className='text-sm text-gray-500'>Tanggal</div>
                  <div>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className='text-sm text-gray-500'>Total</div>
                  <div className='font-bold'>
                    Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                  </div>
                </div>

                <div>
                  <div className='text-sm text-gray-500'>Status</div>
                  <div
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Package className='w-5 h-5 text-gray-500' />
                    <span className='text-sm text-gray-600'>
                      {order.items.length} produk
                    </span>
                  </div>

                  <div className='flex-1 overflow-x-auto whitespace-nowrap py-2'>
                    {order.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className='inline-block mr-3'>
                        <div className='w-12 h-12 rounded bg-gray-100 overflow-hidden relative'>
                          <Image
                            src={item.product.images[0] || '/placeholder.png'}
                            alt={item.product.name}
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className='inline-block'>
                        <div className='w-12 h-12 rounded bg-gray-200 flex items-center justify-center'>
                          <span className='text-xs font-medium'>
                            +{order.items.length - 3}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link href={`/profile/pesanan-saya/${order.id}`}>
                    <Button variant='outline' size='sm'>
                      Detail Pesanan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
