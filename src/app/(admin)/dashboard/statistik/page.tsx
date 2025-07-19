'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import StatistikSkeleton from './components/StatistikSkeleton'
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
  const [isLoading, setIsLoading] = useState(true)

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
      unit: string
      stock: number
    }[]
  >([])

  const [productSoldDetails, setProductSoldDetails] = useState<number>(0)

  const [salesData, setSalesData] = useState<
    {
      date: string
      fullDate: string
      sales: number
    }[]
  >([])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        const [
          statsResponse,
          bestProductsResponse,
          salesDataResponse,
          productSoldDetailsResponse,
        ] = await Promise.all([
          getDashboardStats(),
          getBestSellingProducts(),
          getSalesData(),
          getProductSoldDetails(),
        ])

        if (statsResponse.success) {
          setDashboardStats(statsResponse.data)
        }

        if (bestProductsResponse.success) {
          // Ensure totalSold is calculated based on completed order items
          const processedProducts = bestProductsResponse.data.map(
            (product) => ({
              ...product,
              totalSold: Number(product.totalSold) || 0,
            })
          )
          console.log('Best selling products data:', processedProducts)
          setBestSellingProducts(processedProducts)
        }

        if (salesDataResponse.success) {
          setSalesData(salesDataResponse.data)
        }

        if (productSoldDetailsResponse.success) {
          setProductSoldDetails(productSoldDetailsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching statistics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const exportSalesToExcel = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()

    // Prepare data for Excel
    const data = [
      ['Tanggal', 'Penjualan'],
      ...salesData.map((item) => [
        item.fullDate, // Tanggal lengkap untuk Excel
        item.sales.toLocaleString(),
      ]),
    ]

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Tanggal column width
      { wch: 15 }, // Penjualan column width
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan Mingguan')

    // Export to Excel file
    XLSX.writeFile(workbook, 'penjualan_mingguan.xlsx')
  }

  const exportBestProductsToExcel = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()

    // Debug: Log the data being exported
    console.log('Exporting best selling products:', bestSellingProducts)

    // Prepare data for Excel
    const data = [
      ['Nama Produk', 'Total Terjual', 'Harga', 'Stok'],
      ...bestSellingProducts.map((product) => [
        product.name || 'N/A',
        `${product.totalSold} ${product.unit}` || 0,
        `${product.price.toLocaleString()}` || 0,
        product.stock || 0,
      ]),
    ]

    console.log('Excel data array:', data)

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Nama Produk column width
      { wch: 15 }, // Total Terjual column width
      { wch: 15 }, // Harga column width
      { wch: 10 }, // Stok column width
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produk Terlaris')

    // Export to Excel file
    XLSX.writeFile(workbook, 'produk_terlaris.xlsx')
  }

  // Show skeleton while loading
  if (isLoading) {
    return <StatistikSkeleton />
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
            <Button
              variant='outline'
              size='sm'
              onClick={exportSalesToExcel}
              disabled={isLoading || salesData.length === 0}>
              <Download className='h-4 w-4 mr-2' />
              Export Excel
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
              onClick={exportBestProductsToExcel}
              disabled={isLoading || bestSellingProducts.length === 0}>
              <Download className='h-4 w-4 mr-2' /> Export Excel
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
