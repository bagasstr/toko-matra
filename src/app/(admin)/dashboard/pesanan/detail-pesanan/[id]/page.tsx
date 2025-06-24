import { getOrderById } from '@/app/actions/orderAction'
import { getPaymentByOrderId } from '@/app/actions/midtransAction'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateFakturPDF } from '@/lib/pdfFakturFormatter'
import { PdfButtons } from './PdfButtons'

interface DetailPesananPageProps {
  params: { orderId: string }
}

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

export default async function DetailPesananPage({
  params,
}: {
  params: { id: string } & Promise<any>
}) {
  const id = params.id
  const orderRes = await getOrderById(id)
  if (!orderRes.success || !orderRes.data) return notFound()
  const order = orderRes.data

  // Fetch payment detail
  const paymentRes = await getPaymentByOrderId(id)
  const payment = paymentRes.success ? paymentRes.data : null
  console.log(order)

  // Load logo directly since this is a server component
  let logoBase64 = ''
  try {
    const { getCompanyLogoBase64 } = await import('@/lib/utils')
    logoBase64 = await getCompanyLogoBase64()
  } catch (error) {
    console.error('Failed to load logo:', error)
  }

  // Calculate data for PDF
  const subtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  )
  const ppn = Math.round(subtotal * 0.11)
  const total = order.totalAmount

  const htmlContent = generateFakturPDF(
    order.items.map((item: any) => ({
      id: item.id,
      product: {
        name: item.product.name,
        price: item.price,
        unit: item.product.unit || 'pcs',
        sku: item.product.sku || '',
        description: item.product.description || '',
      },
      quantity: item.quantity,
    })),
    order.totalAmount,
    logoBase64,
    order.id.replace('ord', 'FAK').replace('-', ''),
    new Date(order.createdAt).toLocaleString('id-ID'),
    order.user.profile.fullName || '-',
    order.user.profile.companyName || '-',
    order.address.city || '-',
    `${order.address?.address || '-'}, ${order.address?.city || '-'}, ${
      order.address?.province || '-'
    }`,
    order.user.profile.email || '-',
    order.user.profile.phoneNumber || '-',
    ''
  )

  // Prepare data for PDF buttons
  const pdfData = {
    items: order.items.map((item: any) => ({
      product: {
        name: item.product.name,
        price: item.price,
        unit: item.product.unit || 'pcs',
        sku: item.product.sku || '',
        description: item.product.description || '',
      },
      quantity: item.quantity,
    })),
    subtotal,
    ppn,
    total,
    logoBase64,
    orderId: order.id,
    orderDate: new Date(order.createdAt).toLocaleString('id-ID'),
    customerName: order.user.profile.fullName || '-',
    customerCompany: order.user.profile.companyName || '-',
    customerAddress: `${order.address?.address || '-'}, ${
      order.address?.city || '-'
    }, ${order.address?.province || '-'}`,
    customerEmail: order.user.profile.email || '-',
    customerPhone: order.user.profile.phoneNumber || '-',
    notes: '',
  }

  return (
    <div className='max-w-3xl mx-auto py-8'>
      <Link
        href='/dashboard/pesanan'
        className='mr-4 flex items-center text-sm text-gray-500 hover:text-gray-700'>
        <ArrowLeft className='h-5 w-5 mr-1' /> Kembali
      </Link>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <h1 className='text-2xl font-bold'>Detail Pesanan</h1>
        </div>
        <PdfButtons data={pdfData} />
      </div>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Info Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <div className='mb-2'>
                <span className='font-semibold'>ID Pesanan:</span> {order.id}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Tanggal:</span>{' '}
                {new Date(order.createdAt).toLocaleString('id-ID')}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Status:</span>{' '}
                {getStatusBadge(order.status)}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Pembayaran:</span>{' '}
                {getStatusBadge(
                  payment?.status || order.payment?.[0]?.status || 'PENDING'
                )}
              </div>
            </div>
            <div>
              <div className='mb-2'>
                <span className='font-semibold'>Pelanggan:</span>{' '}
                {order.user?.profile?.fullName || '-'}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Alamat:</span>{' '}
                {order.address?.address}, {order.address?.city},{' '}
                {order.address?.province}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead className='text-right'>Jumlah</TableHead>
                <TableHead className='text-right'>Harga Satuan</TableHead>
                <TableHead className='text-right'>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className='text-right'>{item.quantity}</TableCell>
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
    </div>
  )
}
