'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'

// Lazy load entire chart component untuk mengurangi initial bundle size
const ChartComponent = dynamic(() => import('./ChartImplementation'), {
  ssr: false,
  loading: () => (
    <div className='h-64 w-full flex items-center justify-center'>
      <div className='animate-pulse bg-gray-200 rounded h-full w-full'></div>
    </div>
  ),
})

interface SalesData {
  date: string
  sales: number
}

interface SalesChartProps {
  data: SalesData[]
}

const SalesChart = memo(({ data }: SalesChartProps) => {
  return <ChartComponent data={data} />
})

SalesChart.displayName = 'SalesChart'

export default SalesChart
