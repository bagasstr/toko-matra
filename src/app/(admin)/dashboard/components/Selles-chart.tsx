'use client'

import { useTheme } from 'next-themes'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const data = [
  {
    name: 'Jan',
    total: 15000000,
  },
  {
    name: 'Feb',
    total: 18000000,
  },
  {
    name: 'Mar',
    total: 25000000,
  },
  {
    name: 'Apr',
    total: 22000000,
  },
  {
    name: 'Mei',
    total: 28000000,
  },
  {
    name: 'Jun',
    total: 32000000,
  },
  {
    name: 'Jul',
    total: 38000000,
  },
  {
    name: 'Agu',
    total: 42000000,
  },
  {
    name: 'Sep',
    total: 45000000,
  },
  {
    name: 'Okt',
    total: 48000000,
  },
  {
    name: 'Nov',
    total: 52000000,
  },
  {
    name: 'Des',
    total: 58000000,
  },
]

export default function SalesChart() {
  const { theme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Penjualan</CardTitle>
        <CardDescription>
          Penjualan bulanan dalam setahun terakhir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}>
              <XAxis
                dataKey='name'
                stroke='#888888'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke='#888888'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000000}jt`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `Rp ${value.toLocaleString()}`,
                  'Total',
                ]}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Line
                type='monotone'
                dataKey='total'
                stroke='#0ea5e9'
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
