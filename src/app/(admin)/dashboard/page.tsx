import React, { Suspense } from 'react'
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
  Bell,
} from 'lucide-react'
import {
  getDashboardStats,
  getBestSellingProducts,
  getRecentOrders,
  getSalesData,
} from '@/app/actions/dashboardAction'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

// Loading components for better UX
const DashboardCardSkeleton = () => (
  <div className='bg-white rounded-lg shadow p-4'>
    <div className='flex items-center justify-between'>
      <div>
        <Skeleton className='h-4 w-24 mb-2' />
        <Skeleton className='h-8 w-16' />
        <Skeleton className='h-3 w-20 mt-1' />
      </div>
      <Skeleton className='h-10 w-10 rounded-lg' />
    </div>
  </div>
)

const ChartSkeleton = () => (
  <div className='bg-white rounded-lg shadow p-4'>
    <Skeleton className='h-6 w-32 mb-4' />
    <Skeleton className='h-64 w-full' />
  </div>
)

const TableSkeleton = () => (
  <div className='bg-white rounded-lg shadow p-4'>
    <Skeleton className='h-6 w-32 mb-4' />
    <div className='space-y-3'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center space-x-4'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex-1'>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-3 w-2/3' />
          </div>
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
  </div>
)

// Async components for parallel data fetching
async function DashboardStats() {
  const statsResponse = await getDashboardStats()
  const stats = statsResponse.success ? statsResponse.data : null

  return (
    <>
      {stats?.newOrders > 0 && (
        <div
          className={cn(
            'mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center'
          )}>
          <Bell className='h-6 w-6 text-blue-600 mr-3' />
          <div>
            <h3 className='font-semibold text-blue-800'>Pesanan Baru</h3>
            <p className='text-sm text-blue-700'>
              Anda memiliki {stats.newOrders || '0'} pesanan baru yang perlu
              diproses
            </p>
          </div>
        </div>
      )}
      <div className={cn('mb-6 grid grid-cols-1 md:grid-cols-4 gap-4')}>
        <DashboardCard
          title='Pesanan Baru'
          value={stats?.newOrders.toString() || '0'}
          icon={<ShoppingCart className='h-5 w-5' />}
          info='7 hari terakhir'
          iconBg='bg-green-100 text-green-600'
        />
        <DashboardCard
          title='Pelanggan'
          value={stats?.totalCustomers.toString() || '0'}
          icon={<UserCheck className='h-5 w-5' />}
          info='total pelanggan'
          iconBg='bg-yellow-100 text-yellow-600'
        />
        <DashboardCard
          title='Stok Rendah'
          value={`${stats?.lowStockProducts || '0'} Produk`}
          icon={<Package className='h-5 w-5' />}
          info='perlu restock'
          iconBg='bg-red-100 text-red-600'
        />
        <DashboardCard
          title='Produk Terlaris'
          value={stats?.bestSellingProduct || 'Tidak ada'}
          icon={<Star className='h-5 w-5' />}
          info='bulan ini'
          iconBg='bg-purple-100 text-purple-600'
        />
      </div>
    </>
  )
}

async function DashboardCharts() {
  const [bestProductsResponse, salesDataResponse] = await Promise.all([
    getBestSellingProducts(),
    getSalesData(),
  ])

  const bestProducts = bestProductsResponse.success
    ? bestProductsResponse.data
    : []
  const salesData = salesDataResponse.success ? salesDataResponse.data : []

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 mb-6')}>
      <div className={cn('bg-white rounded-lg shadow p-4')}>
        <h2 className='font-semibold mb-2'>Grafik Penjualan</h2>
        <SalesChart data={salesData} />
      </div>
      <div className={cn('bg-white rounded-lg shadow p-4')}>
        <h2 className='font-semibold mb-2'>Produk Terlaris</h2>
        <BestSellingProducts products={bestProducts} />
      </div>
    </div>
  )
}

async function DashboardRecentOrders() {
  const recentOrdersResponse = await getRecentOrders()
  const recentOrders = recentOrdersResponse.success
    ? recentOrdersResponse.data
    : []

  return (
    <div className={cn('bg-white rounded-lg shadow p-4')}>
      <h2 className='font-semibold mb-2'>Pesanan Terbaru</h2>
      <RecentOrders orders={recentOrders} />
    </div>
  )
}

const page = async () => {
  return (
    <div className={cn('px-4 py-6 bg-gray-50 min-h-screen')}>
      <div className={cn('mb-6 flex items-center justify-between')}>
        <h1 className={cn('text-3xl font-bold text-gray-800')}>
          Dashboard Admin
        </h1>
        <p className='text-gray-600'>
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Section with Suspense */}
      <Suspense
        fallback={
          <>
            <div className='mb-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>
          </>
        }>
        <DashboardStats />
      </Suspense>

      {/* Charts Section with Suspense */}
      <Suspense
        fallback={
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }>
        <DashboardCharts />
      </Suspense>

      {/* Recent Orders Section with Suspense */}
      <Suspense fallback={<TableSkeleton />}>
        <DashboardRecentOrders />
      </Suspense>
    </div>
  )
}

export default page
