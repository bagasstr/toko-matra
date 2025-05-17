'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/components/ui/avatar'
import {
  Info,
  Download,
  ArrowRight,
  MessageSquare,
  MoreVertical,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Dummy data for orders
const dummyOrders = [
  {
    id: 'INV/20161025/XVI/X/51234657',
    status: 'new',
    customer: {
      name: 'Pria Kusumawardana',
      phone: '08123456789',
      avatar: '/avatars/customer1.jpg',
    },
    date: {
      order: '12 Sep 2020; 13:14 WIB',
      deadline: '13 Sep; 14:55',
    },
    products: [
      {
        name: 'Air Jordan Gym Red Redemption Hoops Malaysia Original 42.5 EU Terbaik dan Terhemat Pokonya - 200gr, Salted',
        quantity: 1,
        price: 2250000,
        image: '/products/jordan.jpg',
        cashback: 5,
      },
    ],
    address: {
      name: 'Leonardo',
      phone: '08123456789',
      building: 'Tokopedia Tower, Mailing Room',
      street: "Jl. Letjen's parman kav.77, Slipi, Jakarta Barat 14410",
      floor: 'Lantai 29',
    },
    dropshipper: {
      name: 'Venessa Jeremia',
      phone: '08123456789',
    },
    shipping: {
      courier: 'Same Day - Grab',
      weight: '5.6 kg',
      bookingCode: 'BDOE90H42127415',
    },
    totalItems: 3,
    totalPrice: 4800000,
    note: 'Bonusin piring sama gelasnya juga ya kak',
  },
  {
    id: 'INV/20161025/XVI/X/51234658',
    status: 'ready',
    customer: {
      name: 'Budi Santoso',
      phone: '08234567890',
      avatar: '/avatars/customer2.jpg',
    },
    date: {
      order: '13 Sep 2020; 09:30 WIB',
      deadline: '14 Sep; 10:30',
    },
    products: [
      {
        name: 'Semen Tiga Roda 50kg',
        quantity: 10,
        price: 75000,
        image: '/products/semen.jpg',
      },
    ],
    address: {
      name: 'Budi',
      phone: '08234567890',
      building: 'Apartemen primary Garden',
      street: 'Jl. Raya Kebon Jeruk No. 27, Jakarta Barat',
      floor: 'Lantai 5',
    },
    shipping: {
      courier: 'Regular - JNE',
      weight: '500 kg',
      bookingCode: 'JNE123456789',
    },
    totalItems: 1,
    totalPrice: 750000,
    note: 'Mohon diantar pagi hari',
  },
  {
    id: 'INV/20161025/XVI/X/51234659',
    status: 'shipping',
    customer: {
      name: 'Siti Aminah',
      phone: '08345678901',
      avatar: '/avatars/customer3.jpg',
    },
    date: {
      order: '14 Sep 2020; 15:45 WIB',
      deadline: '15 Sep; 16:45',
    },
    products: [
      {
        name: 'Cat Tembok Dulux 20kg',
        quantity: 2,
        price: 450000,
        image: '/products/cat.jpg',
      },
    ],
    address: {
      name: 'Siti',
      phone: '08345678901',
      building: 'Rumah',
      street: 'Jl. Merdeka No. 123, Jakarta Pusat',
      floor: '-',
    },
    shipping: {
      courier: 'Express - SiCepat',
      weight: '40 kg',
      bookingCode: 'SCP987654321',
    },
    totalItems: 1,
    totalPrice: 900000,
    note: 'Tolong dibungkus rapi',
  },
]

// Group orders by status
const orderData = {
  all: dummyOrders.length,
  new: dummyOrders.filter((order) => order.status === 'new').length,
  ready: dummyOrders.filter((order) => order.status === 'ready').length,
  shipping: dummyOrders.filter((order) => order.status === 'shipping').length,
  complained: 1,
  completed: 1,
  cancelled: 5,
}

export default function OrderManagementPage() {
  const [activeTab, setActiveTab] = useState('all')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header Section */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Daftar Pesanan</h1>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        defaultValue='all'
        className='w-full'
        onValueChange={handleTabChange}>
        <TabsList className=''>
          <TabsTrigger value='all'>Semua Pesanan ({orderData.all})</TabsTrigger>
          <TabsTrigger value='new'>Pesanan Baru ({orderData.new})</TabsTrigger>
          <TabsTrigger value='ready'>
            Siap Dikirim ({orderData.ready})
          </TabsTrigger>
          <TabsTrigger value='shipping'>
            Dalam Pengiriman ({orderData.shipping})
          </TabsTrigger>
          <TabsTrigger value='complained'>
            Dikomplain ({orderData.complained})
          </TabsTrigger>
          <TabsTrigger value='completed'>
            Pesanan Selesai ({orderData.completed})
          </TabsTrigger>
          <TabsTrigger value='cancelled'>
            Dibatalkan ({orderData.cancelled})
          </TabsTrigger>
        </TabsList>
        {/* Search and Filter Bar */}
        <div className='flex gap-4'>
          <Input placeholder='Cari produk di sini...' className='flex-1' />
          <Button variant='outline'>Pilih Filter</Button>
          <Button variant='outline'>Urutkan</Button>
          <Button variant='outline'>Pilih Tanggal Transaksi</Button>
        </div>

        {/* Tab Contents */}
        <TabsContent value='all' className='mt-6'>
          <OrderList orders={dummyOrders} status='all' />
        </TabsContent>
        <TabsContent value='new' className='mt-6'>
          <OrderList
            orders={dummyOrders.filter((order) => order.status === 'new')}
            status='new'
          />
        </TabsContent>
        <TabsContent value='ready' className='mt-6'>
          <OrderList
            orders={dummyOrders.filter((order) => order.status === 'ready')}
            status='ready'
          />
        </TabsContent>
        <TabsContent value='shipping' className='mt-6'>
          <OrderList
            orders={dummyOrders.filter((order) => order.status === 'shipping')}
            status='shipping'
          />
        </TabsContent>
        <TabsContent value='complained' className='mt-6'>
          <OrderList orders={[]} status='complained' />
        </TabsContent>
        <TabsContent value='completed' className='mt-6'>
          <OrderList orders={[]} status='completed' />
        </TabsContent>
        <TabsContent value='cancelled' className='mt-6'>
          <OrderList orders={[]} status='cancelled' />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className='flex justify-center gap-2'>
        {[1, 2, 3, 4, 5, 6, 7].map((page) => (
          <Button
            key={page}
            variant={page === 1 ? 'default' : 'outline'}
            className={page === 1 ? 'bg-primary hover:bg-primary-700' : ''}>
            {page}
          </Button>
        ))}
      </div>
    </div>
  )
}

// OrderList component to display orders based on status
function OrderList({
  orders,
  status,
}: {
  orders: typeof dummyOrders
  status: string
}) {
  const [selectedCount, setSelectedCount] = useState(0)

  return (
    <div className='space-y-4'>
      {/* Selected Orders Bar */}
      <div className='flex items-center justify-between bg-gray-50 p-4 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='select-all'
            onCheckedChange={(checked) =>
              setSelectedCount(checked ? orders.length : 0)
            }
          />
          <label htmlFor='select-all'>{selectedCount} Pesanan dipilih</label>
        </div>
        <div className='space-x-4'>
          <Button variant='outline'>Terima Pesanan</Button>
          <Button variant='outline'>Cetak Invoice</Button>
          <Button variant='outline'>Download Daftar Produk</Button>
        </div>
      </div>

      {/* Order Cards */}
      {orders.map((order) => (
        <Card key={order.id} className='p-6'>
          <div className='space-y-6'>
            {/* Order Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Checkbox />
                <Badge
                  variant='outline'
                  className='bg-primary-100 text-primary-700'>
                  {order.status === 'new'
                    ? 'Pesanan Baru'
                    : order.status === 'ready'
                    ? 'Siap Dikirim'
                    : order.status === 'shipping'
                    ? 'Dalam Pengiriman'
                    : order.status === 'complained'
                    ? 'Dikomplain'
                    : order.status === 'completed'
                    ? 'Selesai'
                    : order.status === 'cancelled'
                    ? 'Dibatalkan'
                    : 'Semua'}
                </Badge>
                <span className='text-primary font-medium'>{order.id}</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8' />
                  <span>{order.customer.name}</span>
                </div>
                <div className='text-sm text-gray-500'>
                  <div>{order.date.order}</div>
                  <div>{order.date.deadline}</div>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className='grid grid-cols-3 gap-6'>
              {/* Left Column - Product Information */}
              <div className='space-y-4'>
                <Badge variant='outline'>Penjualan dari Toped</Badge>
                {order.products.map((product, index) => (
                  <div key={index} className='flex gap-4'>
                    <div className='w-20 h-20 bg-gray-100 rounded'></div>
                    <div className='space-y-2'>
                      <p className='text-sm'>{product.name}</p>
                      <p className='text-sm'>
                        {product.quantity} x Rp{product.price.toLocaleString()}
                      </p>
                      {product.cashback && (
                        <Badge className='bg-primary-100 text-primary-700'>
                          Cashback {product.cashback}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <p className='text-sm text-gray'>{order.note}</p>
                {order.products.length > 1 && (
                  <Button variant='link' className='text-primary p-0'>
                    Lihat {order.products.length - 1} Produk Lainnya
                  </Button>
                )}
              </div>

              {/* Middle Column - Address Information */}
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-2'>Alamat</h4>
                  <div className='text-sm space-y-1'>
                    <p>
                      {order.address.name} ({order.address.phone})
                    </p>
                    <p>{order.address.building}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.floor}</p>
                  </div>
                </div>
                {order.dropshipper && (
                  <div>
                    <h4 className='font-medium mb-2'>Dropshipper</h4>
                    <p className='text-sm'>
                      {order.dropshipper.name} ({order.dropshipper.phone})
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Shipping Information */}
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-2'>Kurir</h4>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm'>
                      {order.shipping.courier} ({order.shipping.weight})
                    </p>
                    <Button variant='link' className='text-primary p-0'>
                      Info Detail
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className='font-medium mb-2'>Kode Booking</h4>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm'>{order.shipping.bookingCode}</p>
                    <Button variant='link' className='text-primary p-0'>
                      Info Detail
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Footer */}
            <div className='flex justify-between items-center pt-4 border-t'>
              <div className='flex items-center gap-4'>
                <Button variant='outline' size='sm'>
                  Detail Status
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  Chat Pembeli
                </Button>
                <div className='relative'>
                  <Textarea
                    placeholder='Catatan toko'
                    className='w-64'
                    maxLength={60}
                  />
                  <span className='absolute bottom-2 right-2 text-xs text-gray-500'>
                    0/60
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-right'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>
                      Total Harga ({order.totalItems} Barang)
                    </span>
                    <Info className='h-4 w-4 text-gray-400' />
                  </div>
                  <p className='text-xl font-bold'>
                    Rp{order.totalPrice.toLocaleString()}
                  </p>
                </div>
                <Button variant='ghost' size='icon'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
                <Button className='bg-primary hover:bg-primary-700'>
                  Terima Pesanan
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
