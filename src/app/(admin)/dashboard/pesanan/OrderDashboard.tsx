'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '@/app/actions/orderAction'
import { formatCurrency } from '@/lib/helpper'
import { OrderStatus } from '@prisma/client'
import { MoreHorizontal, Filter, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function OrderDashboard({
  initialOrders,
}: {
  initialOrders: any[]
}) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Semua Status')

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const response = await getAllOrders()
      if (response.success) {
        setOrders(response.data || [])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [])

  console.log(orders)

  const filteredOrders =
    statusFilter === 'Semua Status'
      ? orders
      : orders.filter((order) => order.status === statusFilter)

  const handleStatusChange = async (orderId, newStatus) => {
    const response = await updateOrderStatus(orderId, newStatus)
    if (response.success) {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    }
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Daftar Pesanan</h1>
        <div className='text-sm text-gray-500'>
          Kelola semua pesanan pelanggan Anda di satu tempat
        </div>
      </div>

      <div className='flex justify-between items-center mb-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Cari pesanan atau pelanggan...'
            className='pl-8 pr-4 py-2 border rounded-md w-80'
          />
          <svg
            className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>

        <div className='flex gap-2'>
          <div className='relative'>
            <button className='flex items-center gap-2 px-3 py-2 border rounded-md'>
              <Filter className='h-4 w-4' />
              <span>{statusFilter}</span>
              <svg
                className='h-4 w-4 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className='absolute inset-0 cursor-pointer' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('Semua Status')}>
                  Semua Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(OrderStatus.PENDING)}>
                  Menunggu Pembayaran
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(OrderStatus.PROCESSING)}>
                  Diproses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(OrderStatus.SHIPPED)}>
                  Dikirim
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(OrderStatus.DELIVERED)}>
                  Selesai
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter(OrderStatus.CANCELLED)}>
                  Dibatalkan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button className='flex items-center gap-2 px-3 py-2 border rounded-md'>
            <Download className='h-4 w-4' />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                ID Pesanan
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Pelanggan
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tanggal
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td colSpan={6} className='px-6 py-4 text-center'>
                  <div className='flex justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='px-6 py-4 text-center text-sm text-gray-500'>
                  Tidak ada pesanan ditemukan
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {order.user?.profile?.fullName || 'Pelanggan'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        order.status === OrderStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : ''
                      }
                      ${
                        order.status === OrderStatus.PROCESSING
                          ? 'bg-blue-100 text-blue-800'
                          : ''
                      }
                      ${
                        order.status === OrderStatus.SHIPPED
                          ? 'bg-indigo-100 text-indigo-800'
                          : ''
                      }
                      ${
                        order.status === OrderStatus.DELIVERED
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                      ${
                        order.status === OrderStatus.CANCELLED
                          ? 'bg-red-100 text-red-800'
                          : ''
                      }
                    `}>
                      {order.status === OrderStatus.PENDING &&
                        'Menunggu Pembayaran'}
                      {order.status === OrderStatus.PROCESSING && 'Diproses'}
                      {order.status === OrderStatus.SHIPPED && 'Dikirim'}
                      {order.status === OrderStatus.DELIVERED && 'Selesai'}
                      {order.status === OrderStatus.CANCELLED && 'Dibatalkan'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className='text-indigo-600 hover:text-indigo-900'>
                          Detail
                        </button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                          <DialogTitle>
                            Detail Pesanan #{order.id.substring(0, 8)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className='space-y-4 py-4'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <h4 className='text-sm font-medium'>
                                Informasi Pelanggan
                              </h4>
                              <p className='text-sm text-gray-500'>
                                {order.user?.profile?.fullName || '-'}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {order.user?.profile?.email || '-'}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {order.user?.profile?.phoneNumber || '-'}
                              </p>
                            </div>
                            <div>
                              <h4 className='text-sm font-medium'>
                                Informasi Pengiriman
                              </h4>
                              <p className='text-sm text-gray-500 space-x-2'>
                                {`${order.address?.address || '-'} Kel. ${
                                  order.address?.village || '-'
                                } Kec. ${order.address?.district || '-'} ${
                                  order.address?.city || '-'
                                } Prov. ${order.address?.province || '-'} ${
                                  order.address?.postalCode || '-'
                                }`}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className='text-sm font-medium mb-2'>
                              Produk yang Dibeli
                            </h4>
                            <div className='border rounded-md divide-y'>
                              {order.orderItems?.map((item) => (
                                <div
                                  key={item.id}
                                  className='flex justify-between p-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-gray-200 rounded-md'></div>
                                    <div>
                                      <p className='text-sm font-medium'>
                                        {item.product?.name || 'Produk'}
                                      </p>
                                      <p className='text-xs text-gray-500'>
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <p className='text-sm font-medium'>
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className='flex justify-between pt-4 border-t'>
                            <span className='font-medium'>Total</span>
                            <span className='font-bold'>
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>

                          <div className='pt-4 border-t'>
                            <h4 className='text-sm font-medium mb-2'>
                              Ubah Status
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {Object.values(OrderStatus).map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(order.id, status)
                                  }
                                  className={`px-3 py-1 text-xs rounded-full border 
                                    ${
                                      order.status === status
                                        ? 'bg-indigo-100 border-indigo-500 text-indigo-800'
                                        : 'border-gray-300 text-gray-700'
                                    }
                                  `}>
                                  {status === OrderStatus.PENDING &&
                                    'Menunggu Pembayaran'}
                                  {status === OrderStatus.PROCESSING &&
                                    'Diproses'}
                                  {status === OrderStatus.SHIPPED && 'Dikirim'}
                                  {status === OrderStatus.DELIVERED &&
                                    'Selesai'}
                                  {status === OrderStatus.CANCELLED &&
                                    'Dibatalkan'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className='ml-2 text-gray-400 hover:text-gray-500'>
                          <MoreHorizontal className='h-4 w-4' />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.PROCESSING)
                          }>
                          Proses Pesanan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.SHIPPED)
                          }>
                          Kirim Pesanan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.DELIVERED)
                          }>
                          Selesaikan Pesanan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.CANCELLED)
                          }
                          className='text-red-600'>
                          Batalkan Pesanan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
