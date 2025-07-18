'use client'

import { useState, useEffect } from 'react'
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderResi,
} from '@/app/actions/orderAction'
import { OrderStatus } from '@/types/order'
import { formatCurrency } from '@/lib/helpper'
import {
  MoreHorizontal,
  Filter,
  Download,
  Loader2,
  AlertTriangle,
  Phone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table'
import { PurchaseOrderPdfButton } from '@/app/(client)/components/DownloadPdfButton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createNotification } from '@/app/actions/notificationAction'
import { toast } from 'sonner'
import {
  sendOrderConfirmedNotification,
  sendOrderShippedNotification,
  sendOrderDeliveredNotification,
  sendOrderCancelledNotification,
} from '@/app/actions/orderStatusNotification'
import ProductPagination from '@/components/ProductPagination'

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge variant='outline'>Menunggu Pembayaran</Badge>
    case 'CONFIRMED':
      return (
        <Badge variant='outline' className='bg-green-100 text-green-800'>
          Diproses
        </Badge>
      )
    case 'SHIPPED':
      return (
        <Badge variant='outline' className='bg-blue-100 text-blue-800'>
          Dikirim
        </Badge>
      )
    case 'DELIVERED':
      return (
        <Badge variant='outline' className='bg-purple-100 text-purple-800'>
          Terkirim
        </Badge>
      )
    case 'CANCELLED':
      return (
        <Badge variant='outline' className='bg-red-100 text-red-800'>
          Dibatalkan
        </Badge>
      )
    case 'SUCCESS':
      return (
        <Badge variant='outline' className='bg-green-100 text-green-800'>
          Lunas
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge variant='outline' className='bg-red-100 text-red-800'>
          Gagal
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

export default function OrderDashboard({
  initialOrders,
}: {
  initialOrders: any[]
}) {
  const [logoBase64, setLogoBase64] = useState<string>('')

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { getCompanyLogoBase64 } = await import('@/lib/utils')
        const logoData = await getCompanyLogoBase64()
        setLogoBase64(logoData)
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }
    loadLogo()
  }, [])
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [resi, setResi] = useState('')
  const [showSupplierAlert, setShowSupplierAlert] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: orders = initialOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllOrders()
      if (response.success) {
        return response.data || []
      }
      return []
    },
    initialData: initialOrders,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })

  const queryClient = useQueryClient()

  const status = {
    'Semua Status': 'Semua Status',
    [OrderStatus.PENDING]: 'Menunggu Pembayaran',
    [OrderStatus.CONFIRMED]: 'Diproses',
    [OrderStatus.SHIPPED]: 'Dikirim',
    [OrderStatus.DELIVERED]: 'Selesai',
    [OrderStatus.CANCELLED]: 'Dibatalkan',
  }

  const filteredOrders =
    statusFilter === 'Semua Status'
      ? orders
      : orders.filter((order) => order.status === statusFilter)

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [filteredOrders, totalPages])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log('Starting handleStatusChange:', { orderId, newStatus })
    const response = await updateOrderStatus(orderId, newStatus as OrderStatus)
    console.log('updateOrderStatus response:', response)

    if (response.success) {
      const order = orders.find((order) => order.id === orderId)
      console.log('Found order:', order)
      const userId = order?.userId
      console.log('User ID for notification:', userId)

      switch (newStatus) {
        case OrderStatus.CONFIRMED:
          // Set current order ID for supplier alert
          setCurrentOrderId(orderId)
          setShowSupplierAlert(true)

          // Create in-app notification
          await createNotification(
            userId,
            'Pesanan Dikonfirmasi',
            'Pesanan kamu sudah kami konfirmasi dan sedang diproses.'
          )
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          // Send email notification
          try {
            await sendOrderConfirmedNotification(orderId)
            console.log('Order confirmed email sent successfully')
          } catch (error) {
            console.error('Failed to send order confirmed email:', error)
          }
          break

        case OrderStatus.SHIPPED:
          console.log('Creating SHIPPED notification')
          const notificationResult = await createNotification(
            userId,
            'Pesanan Dikirim',
            'Pesanan kamu sudah kami kirim. Terima kasih telah berbelanja di Matrakosala!'
          )
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          console.log('SHIPPED notification result:', notificationResult)

          // Send email notification
          try {
            await sendOrderShippedNotification(orderId)
            console.log('Order shipped email sent successfully')
          } catch (error) {
            console.error('Failed to send order shipped email:', error)
          }
          break

        case OrderStatus.DELIVERED:
          await createNotification(
            userId,
            'Pesanan Selesai',
            'Pesanan kamu sudah selesai. Terima kasih telah berbelanja di Matrakosala!'
          )
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          // Send email notification
          try {
            await sendOrderDeliveredNotification(orderId)
            console.log('Order delivered email sent successfully')
          } catch (error) {
            console.error('Failed to send order delivered email:', error)
          }
          break

        case OrderStatus.CANCELLED:
          await createNotification(
            userId,
            'Pesanan Dibatalkan',
            'Mohon maaf, pesanan kamu dibatalkan. Silakan hubungi kami untuk informasi lebih lanjut.'
          )
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          // Send email notification
          try {
            await sendOrderCancelledNotification(orderId)
            console.log('Order cancelled email sent successfully')
          } catch (error) {
            console.error('Failed to send order cancelled email:', error)
          }
          break
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Invalidate notifications for the specific user
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      }
    }
  }

  const handleUpdateResi = async () => {
    await updateOrderResi(orders[0].id, resi)
  }

  const handleSupplierContact = () => {
    // Close the alert
    setShowSupplierAlert(false)

    // You can add additional logic here like:
    // - Opening supplier contact modal
    // - Redirecting to supplier management page
    // - Logging the action
  }

  return (
    <div className='container mx-auto'>
      {/* Supplier Contact Alert Dialog */}

      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Daftar Pesanan</h1>
        <div className='text-sm text-gray-500'>
          Kelola semua pesanan pelanggan Anda di satu tempat
        </div>
      </div>

      {/* Enhanced Admin Notification Banner */}
      {filteredOrders.some(
        (order) => order.status === OrderStatus.CONFIRMED
      ) && (
        <div className='mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='h-5 w-5 text-orange-500 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='font-semibold text-orange-800'>
                Ada Pesanan yang Perlu Konfirmasi Supplier
              </h3>
              <p className='text-sm text-orange-700'>
                {
                  filteredOrders.filter(
                    (order) => order.status === OrderStatus.CONFIRMED
                  ).length
                }{' '}
                pesanan telah dikonfirmasi. Silakan hubungi supplier untuk
                konfirmasi ketersediaan barang.
              </p>
            </div>
            {/* <Button
              variant='outline'
              size='sm'
              className='border-orange-300 text-orange-700 hover:bg-orange-100'
              onClick={() => {
                toast.info('Daftar Supplier', {
                  description:
                    'Fitur ini akan menampilkan daftar supplier yang perlu dihubungi.',
                  duration: 5000,
                })
              }}>
              Lihat Supplier
            </Button> */}
          </div>
        </div>
      )}

      <div className='flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4'>
        <div className='relative w-full md:w-auto'>
          <input
            type='text'
            placeholder='Cari pesanan atau pelanggan...'
            className='pl-8 pr-4 py-2 border rounded-md w-full md:w-80'
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

        <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
          <div className='relative'>
            <button className='flex items-center gap-2 px-3 py-2 border rounded-md w-full sm:w-auto'>
              <Filter className='h-4 w-4' />
              <span>{status[statusFilter]}</span>
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
                  onClick={() => setStatusFilter(OrderStatus.CONFIRMED)}>
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

          <button className='flex items-center gap-2 px-3 py-2 border rounded-md w-full sm:w-auto'>
            <Download className='h-4 w-4' />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <table className='min-w-[600px] w-full divide-y divide-gray-200'>
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
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='px-6 py-4 text-center'>
                  <div className='flex justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
                  </div>
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='px-6 py-4 text-center text-sm text-gray-500'>
                  Tidak ada pesanan ditemukan
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.status === OrderStatus.CONFIRMED ? 'bg-blue-50' : ''
                  }>
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
                      className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === OrderStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : ''
                        }
                        ${
                          order.status === OrderStatus.CONFIRMED
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
                      {order.status === OrderStatus.CONFIRMED && (
                        <>
                          <Loader2 className='w-3 h-3 animate-spin mr-1' />
                          Diproses
                        </>
                      )}
                      {order.status === OrderStatus.SHIPPED && 'Dikirim'}
                      {order.status === OrderStatus.DELIVERED && 'Selesai'}
                      {order.status === OrderStatus.CANCELLED && 'Dibatalkan'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant='outline'>Detail</Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-7xl lg:max-w-2xl max-h-[90vh] overflow-y-auto'>
                        <DialogHeader>
                          <DialogTitle>
                            Detail Pesanan #{order.id.substring(0, 8)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className='max-w-3xl mx-auto py-8'>
                          <div className='flex items-center justify-between mb-6'>
                            <div className='flex items-center'>
                              <h1 className='text-2xl font-bold'>
                                Detail Pesanan
                              </h1>
                            </div>
                          </div>
                          <Card className='mb-6'>
                            <CardHeader>
                              <CardTitle className='text-lg'>
                                Info Pesanan
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      ID Pesanan:
                                    </span>{' '}
                                    {order.id}
                                  </div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      Tanggal:
                                    </span>{' '}
                                    {new Date(order.createdAt).toLocaleString(
                                      'id-ID'
                                    )}
                                  </div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      Status:
                                    </span>{' '}
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      Pembayaran:
                                    </span>{' '}
                                    {getStatusBadge(
                                      order.payment?.[0]?.status || 'PENDING'
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      Pelanggan:
                                    </span>{' '}
                                    {order.user?.profile?.fullName || '-'}
                                  </div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      Alamat:
                                    </span>{' '}
                                    {order.address?.address},{' '}
                                    {order.address?.city},{' '}
                                    {order.address?.province}
                                  </div>
                                  <div className='mb-2'>
                                    <span className='font-semibold'>
                                      No. HP:
                                    </span>{' '}
                                    {order.user?.profile?.phoneNumber}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className='mb-6'>
                            <CardHeader>
                              <CardTitle className='text-lg'>
                                Daftar Produk
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead className='text-right'>
                                      Jumlah
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      Harga Satuan
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      Subtotal
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items.map((item: any, idx: number) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <div>
                                          <div className='font-medium'>
                                            {item.product.name}
                                          </div>
                                          {/* Find matching shipment item notes */}
                                          {order.shipment?.[0]?.notes && (
                                            <div className='mt-2 p-2 bg-gray-50 rounded text-xs'>
                                              <span className='font-medium text-gray-600'>
                                                Catatan:{' '}
                                              </span>
                                              <span className='text-gray-700'>
                                                {order.shipment[0].notes}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className='text-right'>
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell className='text-right'>
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }).format(item.price)}
                                      </TableCell>
                                      <TableCell className='text-right'>
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }).format(item.price * item.quantity)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                          <div className='flex justify-end'>
                            <div className='text-xl font-bold'>
                              Total:{' '}
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(order.totalAmount)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex justify-end gap-4 mt-6'>
                            {order.status === OrderStatus.CONFIRMED && (
                              <Button
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    OrderStatus.SHIPPED
                                  )
                                }
                                className='bg-primary hover:bg-primary/80'>
                                Kirim Pesanan
                              </Button>
                            )}
                            {order.status === OrderStatus.SHIPPED && (
                              <Button
                                variant='outline'
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    OrderStatus.DELIVERED
                                  )
                                }
                                className=''>
                                Selesaikan Pesanan
                              </Button>
                            )}
                            <PurchaseOrderPdfButton
                              items={order.items.map((item: any) => ({
                                product: {
                                  name: item.product.name,
                                  price: item.price,
                                  unit: item.product.unit || 'pcs',
                                  sku: item.product.sku,
                                  description: item.product.description,
                                },
                                quantity: item.quantity,
                              }))}
                              subtotal={order.totalAmount}
                              ppn={Math.round(order.totalAmount * 0.11)}
                              total={Math.round(order.totalAmount * 1.11)}
                              logoBase64={logoBase64}
                              poNumber={order.id}
                              poDate={new Date(
                                order.createdAt
                              ).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                              supplierName={
                                order.user?.profile?.fullName || '-'
                              }
                              supplierCompany={
                                order.user?.profile?.companyName || '-'
                              }
                              supplierAddress={`${
                                order.address?.address || '-'
                              }, ${order.address?.city || '-'}, ${
                                order.address?.province || '-'
                              }`}
                              supplierEmail={order.user?.profile?.email || '-'}
                              supplierPhone={
                                order.user?.profile?.phoneNumber || '-'
                              }
                              deliveryAddress={`${
                                order.address?.address || '-'
                              }, ${order.address?.city || '-'}, ${
                                order.address?.province || '-'
                              } ${order.address?.postalCode || ''}`}
                              deliveryDate={new Date(
                                order.createdAt
                              ).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                              paymentTerms='Net 30'
                              notes='Silakan hubungi supplier untuk konfirmasi ketersediaan barang'
                              disabled={false}
                            />
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
                            handleStatusChange(order.id, OrderStatus.CONFIRMED)
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
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
