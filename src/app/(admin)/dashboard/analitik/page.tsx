import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import DashboardHeader from '../components/Dashboard-header'
import DashboardWrap from '../components/Dashboard-wrapper'
import SalesChart from '../components/Selles-chart'
import { BestSellingProducts } from '../components/Best-selling-products'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const Analitik = async () => {
  const user = await validateSession()
  if (!user && user?.user.role !== 'ADMIN') {
    redirect('/login-admin')
  }

  return (
    <DashboardWrap>
      <DashboardHeader heading='Analitik' text='Analisis Data Penjualan'>
        <div className={cn('')}></div>
      </DashboardHeader>

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

      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4')}>
        <Card>
          <CardHeader>
            <CardTitle>Total Penjualan</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>Rp 48.500.000</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Pesanan</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>156</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Nilai Pesanan</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>Rp 310.897</div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrap>
  )
}

export default Analitik
