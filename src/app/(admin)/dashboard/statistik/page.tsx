'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getDashboardStats,
  getBestSellingProducts,
  getSalesData,
  getProductSoldDetails,
} from '@/app/actions/dashboardAction'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StatistikPage() {
  const [dashboardStats, setDashboardStats] = useState<{
    newOrders: number
    totalCustomers: number
    lowStockProducts: number
    bestSellingProduct: string
  } | null>(null)

  const [bestSellingProducts, setBestSellingProducts] = useState<
    {
      name: string
      totalSold: number
      price: number
      stock: number
    }[]
  >([])

  const [productSoldDetails, setProductSoldDetails] = useState<number>(0)

  const [salesData, setSalesData] = useState<
    {
      date: string
      sales: number
    }[]
  >([])

  useEffect(() => {
    async function fetchData() {
      const statsResponse = await getDashboardStats()
      const bestProductsResponse = await getBestSellingProducts()
      const salesDataResponse = await getSalesData()
      const productSoldDetailsResponse = await getProductSoldDetails()
      if (statsResponse.success) {
        setDashboardStats(statsResponse.data)
      }

      if (bestProductsResponse.success) {
        // Ensure totalSold is calculated based on completed order items
        const processedProducts = bestProductsResponse.data.map((product) => ({
          ...product,
          totalSold: Number(product.totalSold) || 0,
        }))
        setBestSellingProducts(processedProducts)
      }

      if (salesDataResponse.success) {
        setSalesData(salesDataResponse.data)
      }

      if (productSoldDetailsResponse.success) {
        setProductSoldDetails(productSoldDetailsResponse.data)
      }
    }

    fetchData()
  }, [])

  const exportSalesToCSV = () => {
    const csvContent = [
      '"Tanggal";"Penjualan"',
      ...salesData.map((item) => `"${item.date}";"${item.sales}"`),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'penjualan_mingguan.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportBestProductsToCSV = () => {
    const csvContent = [
      '"Nama Produk";"Total Terjual";"Harga";"Stok"',
      ...bestSellingProducts.map(
        (product) =>
          `"${product.name
            .replace(/"/g, '""')
            .replace(/\\r?\\n|\\r/g, ' ')}";` +
          `"${product.totalSold}";` +
          `"${product.price}";` +
          `"${product.stock}"`
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'produk_terlaris.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Statistik Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pesanan Baru</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dashboardStats?.newOrders ?? '-'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Dalam 7 hari terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Pelanggan
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dashboardStats?.totalCustomers ?? '-'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Jumlah pelanggan terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Produk Stok Rendah
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dashboardStats?.lowStockProducts ?? '-'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Produk dengan stok &lt; 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Produk Terlaris
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dashboardStats?.bestSellingProduct ?? '-'}
            </div>
            <p className='text-xs text-muted-foreground'>Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Penjualan Mingguan</CardTitle>
            <Button variant='outline' size='sm' onClick={exportSalesToCSV}>
              <Download className='h-4 w-4 mr-2' /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={salesData}>
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `Rp ${value.toLocaleString()}`,
                    'Penjualan',
                  ]}
                />
                <Bar dataKey='sales' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Produk Terlaris</CardTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={exportBestProductsToCSV}>
              <Download className='h-4 w-4 mr-2' /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {bestSellingProducts.map((product, index) => (
                <div key={index} className='flex justify-between items-center'>
                  <div>
                    <div className='font-medium'>{product.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      Terjual: {productSoldDetails}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div>Rp {product.price.toLocaleString()}</div>
                    <div className='text-sm text-muted-foreground'>
                      Stok: {product.stock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
