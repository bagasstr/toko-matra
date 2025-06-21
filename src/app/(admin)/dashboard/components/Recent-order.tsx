'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface OrderItem {
  product: {
    name: string
  }
  quantity: number
  price: number
}

interface Order {
  id: string
  createdAt: string
  user: {
    profile: {
      fullName: string
    }
  }
  items: OrderItem[]
  totalAmount: number
  status: string
  payment: {
    status: string
  }[]
}

interface RecentOrdersProps {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusBadge = (status: string) => {
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
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const getPaymentStatus = (payments: { status: string }[]) => {
    const lastPayment = payments[payments.length - 1]
    if (!lastPayment) return 'PENDING'
    return lastPayment.status
  }

  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pesanan</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className='text-right'>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pembayaran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className='font-medium'>{order.id}</TableCell>
              <TableCell>{order.user.profile.fullName}</TableCell>
              <TableCell>
                {format(new Date(order.createdAt), 'dd MMM yyyy', {
                  locale: id,
                })}
              </TableCell>
              <TableCell className='text-right'>
                {isNaN(order.totalAmount)
                  ? '-'
                  : new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(order.totalAmount)}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {getStatusBadge(getPaymentStatus(order.payment))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
