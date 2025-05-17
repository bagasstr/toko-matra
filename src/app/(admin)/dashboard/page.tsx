import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import React from 'react'
import DashboardNav from './components/Dashboard-nav'
import DashboardCard from './components/Dashboard-card'
import { cn } from '@/lib/utils'
import { BestSellingProducts } from './components/Best-selling-products'
import SalesChart from './components/Selles-chart'
import RecentOrders from './components/Recent-order'
import {
  CreditCard,
  Package,
  ShoppingCart,
  UserCheck,
  Star,
  Truck,
} from 'lucide-react'

export const getSessions = async () => {
  const user = await validateSession()
  return user
}

const page = async () => {
  const user = await validateSession()
  if (!user && user?.user.role !== 'ADMIN') {
    redirect('/login-admin')
  }

  return (
    <div className={cn('px-4 py-6 bg-gray-50 min-h-screen')}>
      <div className={cn('mb-6 flex items-center justify-between')}>
        <h1 className={cn('text-3xl font-bold text-gray-800')}>
          Dashboard Admin
        </h1>
        {/* Tambahkan greeting atau tanggal di sini jika perlu */}
      </div>
      <div className={cn('mb-6 grid grid-cols-1 md:grid-cols-4 gap-4')}>
        <DashboardCard
          title='Pesanan Baru'
          value='320'
          icon={<ShoppingCart className='h-5 w-5' />}
          info='7 hari terakhir'
          iconBg='bg-green-100 text-green-600'
        />
        <DashboardCard
          title='Pelanggan'
          value='1.200'
          icon={<UserCheck className='h-5 w-5' />}
          info='bulan ini'
          iconBg='bg-yellow-100 text-yellow-600'
        />
        <DashboardCard
          title='Stok Rendah'
          value='8 Produk'
          icon={<Package className='h-5 w-5' />}
          info='perlu restock'
          iconBg='bg-red-100 text-red-600'
        />
        <DashboardCard
          title='Produk Terlaris'
          value='Semen Portland'
          icon={<Star className='h-5 w-5' />}
          info='120 terjual bulan ini'
          iconBg='bg-purple-100 text-purple-600'
        />
      </div>
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 mb-6')}>
        <div className={cn('bg-white rounded-lg shadow p-4')}>
          <h2 className='font-semibold mb-2'>Grafik Penjualan</h2>
          <SalesChart />
        </div>
        <div className={cn('bg-white rounded-lg shadow p-4')}>
          <h2 className='font-semibold mb-2'>Produk Terlaris</h2>
          <BestSellingProducts />
        </div>
      </div>
      <div className={cn('bg-white rounded-lg shadow p-4')}>
        <h2 className='font-semibold mb-2'>Pesanan Terbaru</h2>
        <RecentOrders />
      </div>
    </div>
  )
}

export default page
