'use client'

import React, { useState } from 'react'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Eye,
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPaidOrders } from '@/app/actions/delivery-note'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { generateSuratJalanPDF } from '@/lib/pdfSJFormatter'
import { PdfSJButton } from '@/app/(client)/components/DownloadPdfButton'

// Sample data untuk surat jalan

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='outline' className='text-yellow-600 border-yellow-600'>
          <Clock className='w-3 h-3 mr-1' />
          Pending
        </Badge>
      )
    case 'shipped':
      return (
        <Badge variant='outline' className='text-blue-600 border-blue-600'>
          <Truck className='w-3 h-3 mr-1' />
          Dikirim
        </Badge>
      )
    case 'delivered':
      return (
        <Badge variant='outline' className='text-green-600 border-green-600'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Terkirim
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount)
}

export default function SuratJalanDashboard() {
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['paidOrders'],
    queryFn: async () => {
      try {
        const response = await getPaidOrders()
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch orders')
        }
        return response.data || []
      } catch (err) {
        console.error('Error fetching paid orders:', err)
        throw err
      }
    },
  })

  // console.log(orders)

  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNumber: '',
    logisticCompany: '',
    notes: '',
  })
  console.log(selectedOrder)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center text-red-600'>
          <p>Error loading data</p>
          <p className='text-sm'>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  const filteredData = orders.filter((item) => {
    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter
    const matchesSearch =
      item.user?.profile?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((item) => item.status === 'PENDING').length,
    shipped: orders.filter((item) => item.status === 'SHIPPED').length,
    delivered: orders.filter((item) => item.status === 'DELIVERED').length,
  }

  const handleCreateSuratJalan = (orderData: any) => {
    setSelectedOrder(orderData)
    setFormData({
      driverName: '',
      vehicleNumber: '',
      logisticCompany: '',
      notes: '',
    })
    setIsCreateModalOpen(true)
    setShowPdfPreview(false)
  }

  const handleFormSubmit = () => {
    setShowPdfPreview(true)
  }

  const handlePrint = () => {
    window.print()
  }
  let htmlContent = ''
  if (selectedOrder) {
    htmlContent = generateSuratJalanPDF(
      selectedOrder?.items,
      selectedOrder?.id,
      selectedOrder?.createdAt.toLocaleDateString(),
      selectedOrder?.user.profile.fullName,
      selectedOrder?.address.labelAddress,
      selectedOrder?.address.address,
      selectedOrder?.address.city,
      selectedOrder?.address.province,
      selectedOrder?.address.postalCode,
      selectedOrder?.user.profile.phoneNumber,
      formData.driverName,
      formData.vehicleNumber,
      formData.logisticCompany,
      formData.notes
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='p-6'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Dashboard Surat Jalan
          </h1>
          <p className='text-gray-600 mt-2'>
            Kelola surat jalan untuk pesanan yang sudah dibayar
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Surat Jalan
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='h-4 w-4 text-yellow-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Dikirim</CardTitle>
              <Truck className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.shipped}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Terkirim</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.delivered}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <CardTitle>Daftar Surat Jalan</CardTitle>
                <CardDescription>
                  Surat jalan untuk pesanan yang sudah dibayar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row gap-4 mb-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Cari berdasarkan nama, ID surat jalan, atau ID pesanan...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full sm:w-[200px]'>
                  <Filter className='w-4 h-4 mr-2' />
                  <SelectValue placeholder='Filter Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='shipped'>Dikirim</SelectItem>
                  <SelectItem value='delivered'>Terkirim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className='border rounded-lg'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'></TableHead>
                    <TableHead>ID Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className=''>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow className='hover:bg-gray-50'>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleRow(item.id)}
                            className='p-0 h-8 w-8'>
                            {expandedRows.includes(item.id) ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className='font-medium'>{item.id}</TableCell>
                        <TableCell>{item.user.profile.fullName}</TableCell>
                        <TableCell>
                          {item.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {formatCurrency(item.totalAmount)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleCreateSuratJalan(item)}
                              className='text-green-600 border-green-600 hover:bg-green-50'>
                              <Plus className='w-4 h-4 mr-1' />
                              Buat Surat Jalan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row - Order Items */}
                      {expandedRows.includes(item.id) && (
                        <TableRow>
                          <TableCell colSpan={8} className='bg-gray-50 p-0'>
                            <div className='p-4'>
                              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                {/* Customer Info */}
                                <div>
                                  <h4 className='font-semibold mb-3 text-gray-900'>
                                    Informasi Pelanggan
                                  </h4>
                                  <div className='space-y-2 text-sm'>
                                    <div>
                                      <span className='font-medium'>Nama:</span>{' '}
                                      {item.user.profile.fullName}
                                    </div>
                                    <div>
                                      <span className='font-medium'>
                                        Telepon:
                                      </span>{' '}
                                      {item.user.profile.phoneNumber}
                                    </div>
                                    <div>
                                      <span className='font-medium'>
                                        Alamat:
                                      </span>{' '}
                                      {item.address.address}
                                    </div>
                                    <div>
                                      <span className='font-medium'>
                                        Tanggal Dibuat:
                                      </span>{' '}
                                      {item.createdAt.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h4 className='font-semibold mb-3 text-gray-900'>
                                    Detail Barang
                                  </h4>
                                  <div className='space-y-3'>
                                    {item.items.map((orderItem, index) => (
                                      <div
                                        key={index}
                                        className='flex justify-between items-center p-3 bg-white rounded-lg border'>
                                        <div className='flex-1'>
                                          <div className='font-medium text-gray-900'>
                                            {orderItem.product.name}
                                          </div>
                                          <div className='text-sm text-gray-500'>
                                            Qty: {orderItem.quantity} | Berat:{' '}
                                            {orderItem.product.weight}
                                          </div>
                                        </div>
                                        <div className='text-right'>
                                          <div className='font-medium'>
                                            {formatCurrency(orderItem.price)}
                                          </div>
                                          <div className='text-sm text-gray-500'>
                                            per item
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <div className='flex justify-between items-center pt-3 border-t'>
                                      <span className='font-semibold'>
                                        Total Berat:
                                      </span>
                                      <span className='font-semibold'>
                                        {item.items
                                          .reduce((total, orderItem) => {
                                            const weight = Number.parseFloat(
                                              orderItem.product.unit.replace(
                                                ' kg',
                                                ''
                                              )
                                            )
                                            return (
                                              total +
                                              orderItem.product.weight *
                                                orderItem.quantity
                                            )
                                          }, 0)
                                          .toFixed(1)}{' '}
                                        kg
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Create Surat Jalan Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          className={cn(
            'overflow-y-auto',
            showPdfPreview
              ? 'max-w-[90vw] max-h-[90vh]'
              : 'max-w-4xl max-h-[90vh]'
          )}>
          <DialogHeader>
            <DialogTitle>Buat Surat Jalan</DialogTitle>
            <DialogDescription>
              Lengkapi informasi pengiriman untuk membuat surat jalan
            </DialogDescription>
          </DialogHeader>

          {!showPdfPreview ? (
            /* Form Section */
            <div className='space-y-6'>
              {/* Customer Info (Read-only) */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Informasi Pelanggan
                  </Label>
                  <div className='mt-2 space-y-1'>
                    <p className='text-sm'>
                      <span className='font-medium'>Nama:</span>{' '}
                      {selectedOrder?.user.profile.fullName}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Telepon:</span>{' '}
                      {selectedOrder?.user.profile.phoneNumber}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Alamat:</span>{' '}
                      {selectedOrder?.address.address},
                      {selectedOrder?.address.city},
                      {selectedOrder?.address.province},
                      {selectedOrder?.address.postalCode}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Informasi Pesanan
                  </Label>
                  <div className='mt-2 space-y-1'>
                    <p className='text-sm'>
                      <span className='font-medium'>ID Pesanan:</span>{' '}
                      {selectedOrder?.receiptNumber}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Total:</span>{' '}
                      {formatCurrency(selectedOrder?.totalAmount || 0)}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Tanggal:</span>{' '}
                      {selectedOrder?.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items (Read-only) */}
              <div>
                <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                  Daftar Barang
                </Label>
                <div className='border rounded-lg'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Berat</TableHead>
                        <TableHead>Harga</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder?.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>
                            {item.product.name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.product.weight}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Manual Input Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='driverName'>Nama Sopir *</Label>
                  <Input
                    id='driverName'
                    value={formData.driverName}
                    onChange={(e) =>
                      setFormData({ ...formData, driverName: e.target.value })
                    }
                    placeholder='Masukkan nama sopir'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='vehicleNumber'>Nomor Kendaraan *</Label>
                  <Input
                    id='vehicleNumber'
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleNumber: e.target.value,
                      })
                    }
                    placeholder='Contoh: B 1234 ABC'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='logisticCompany'>Nama Logistik *</Label>
                  <Input
                    id='logisticCompany'
                    value={formData.logisticCompany}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logisticCompany: e.target.value,
                      })
                    }
                    placeholder='Contoh: JNE, TIKI, POS Indonesia'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='notes'>Catatan</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder='Catatan tambahan (opsional)'
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  disabled={
                    !formData.driverName ||
                    !formData.vehicleNumber ||
                    !formData.logisticCompany
                  }>
                  Buat Surat Jalan
                </Button>
              </div>
            </div>
          ) : (
            /* PDF Preview Section */
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-semibold'>Preview Surat Jalan</h3>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowPdfPreview(false)}>
                    Edit
                  </Button>

                  <PdfSJButton
                    htmlContent={htmlContent}
                    orderId={selectedOrder?.id}
                  />
                </div>
              </div>

              {/* PDF Content */}
              <div className=''>
                {process.env.NODE_ENV === 'development' && (
                  <iframe
                    title='PDF Preview'
                    srcDoc={htmlContent}
                    style={{
                      width: '100%',
                      height: 600,
                      border: 'none',
                      background: '#fff',
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-content,
          #pdf-content * {
            visibility: visible;
          }
          #pdf-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}
