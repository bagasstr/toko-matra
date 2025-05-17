'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function RecentOrders() {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Budi Santoso',
      status: 'Selesai',
      date: '2023-05-01',
      total: 'Rp 2.450.000',
    },
    {
      id: 'ORD-002',
      customer: 'PT. Karya Abadi',
      status: 'Diproses',
      date: '2023-05-02',
      total: 'Rp 5.780.000',
    },
    {
      id: 'ORD-003',
      customer: 'Toko Jaya Makmur',
      status: 'Dikirim',
      date: '2023-05-03',
      total: 'Rp 1.250.000',
    },
    {
      id: 'ORD-004',
      customer: 'Andi Wijaya',
      status: 'Menunggu Pembayaran',
      date: '2023-05-04',
      total: 'Rp 3.670.000',
    },
    {
      id: 'ORD-005',
      customer: 'CV. Maju Bersama',
      status: 'Selesai',
      date: '2023-05-05',
      total: 'Rp 8.920.000',
    },
  ]

  return (
    <Card className='col-span-7'>
      <CardHeader className='flex flex-row items-center'>
        <div className='grid gap-2'>
          <CardTitle>Pesanan Terbaru</CardTitle>
          <CardDescription>
            Daftar 5 pesanan terbaru yang masuk ke sistem.
          </CardDescription>
        </div>
        <Button variant='outline' size='sm' className='ml-auto'>
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='font-medium'>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'Selesai'
                        ? 'default'
                        : order.status === 'Diproses'
                        ? 'secondary'
                        : order.status === 'Dikirim'
                        ? 'outline'
                        : 'destructive'
                    }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>{order.total}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <span className='sr-only'>Buka menu</span>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem>Lihat detail</DropdownMenuItem>
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Batalkan pesanan</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
