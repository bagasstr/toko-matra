import { getOrderById } from '@/app/actions/orderAction'

import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CancelOrderForm from './CancelOrderForm'
import { validateSession } from '@/app/actions/session'

export const dynamic = 'force-dynamic'

interface CancelOrderPageProps {
  params: {
    id: string
  } & Promise<any>
}

const CancelOrderPage = async ({ params }: CancelOrderPageProps) => {
  const orderId = params.id
  const orderResult = await getOrderById(orderId)
  const order = orderResult.success ? orderResult.data : null
  const session = await validateSession()
  const userId = session?.user?.profile.id.toLowerCase()

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

        <Link
          href={{
            pathname: '/profile/pesanan-saya',
            query: {
              user: userId,
            },
          }}>
          <Button>Lihat Semua Pesanan</Button>
        </Link>
      </div>
    )
  }

  // Check if order can be cancelled
  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    return (
      <div className='max-w-3xl mx-auto py-10 px-4'>
        <div className='flex items-center gap-2 mb-6'>
          <Link href={`/orders/${orderId}`}>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Kembali ke Detail Pesanan
            </Button>
          </Link>
        </div>

        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>Pesanan dengan status {order.status} tidak dapat dibatalkan.</p>
        </div>

        <Link href={`/orders/${orderId}`}>
          <Button>Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto py-10 px-4'>
      <div className='flex items-center gap-2 mb-6'>
        <Link href={`/orders/${orderId}`}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Kembali ke Detail Pesanan
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Batalkan Pesanan</h1>
      </div>

      <div className='bg-yellow-50 text-yellow-800 p-4 rounded-md flex items-center gap-2 mb-6'>
        <AlertCircle className='w-5 h-5' />
        <p>
          Perhatian: Pembatalan pesanan tidak dapat dibatalkan. Apakah Anda
          yakin ingin membatalkan pesanan ini?
        </p>
      </div>

      <div className='rounded-lg border shadow-sm p-6 mb-6'>
        <h2 className='text-lg font-semibold mb-4'>Informasi Pesanan</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <div className='text-sm text-gray-500 mb-1'>ID Pesanan</div>
            <div className='font-medium'>{order.id}</div>
          </div>

          <div>
            <div className='text-sm text-gray-500 mb-1'>Tanggal Pesanan</div>
            <div>
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          <div>
            <div className='text-sm text-gray-500 mb-1'>Total</div>
            <div className='font-bold'>
              Rp {Number(order.totalAmount).toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <div className='text-sm text-gray-500 mb-1'>Status</div>
            <div
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
              {order.status === 'PENDING' ? 'Menunggu Pembayaran' : 'Diproses'}
            </div>
          </div>
        </div>
      </div>

      <CancelOrderForm orderId={orderId} />
    </div>
  )
}

export default CancelOrderPage
