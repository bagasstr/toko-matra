'use client'

import { cn } from '@/lib/utils'
import DashboardHeader from '../components/Dashboard-header'
import DashboardWrap from '../components/Dashboard-wrapper'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ProductsTable from '../components/Product-table'

import { useRouter } from 'next/navigation'

const Produk = () => {
  const router = useRouter()

  return (
    <DashboardWrap>
      <DashboardHeader heading='Produk' text='Produk'>
        <div className={cn('')}>
          <Button
            onClick={() => router.push('/dashboard/produk/tambah-produk')}
            className='mb-4'>
            <span className='flex items-center gap-x-2'>
              <Plus className='h-4 w-4' />
              Tambah Produk
            </span>
          </Button>
        </div>
      </DashboardHeader>
      <ProductsTable />
    </DashboardWrap>
  )
}
export default Produk
