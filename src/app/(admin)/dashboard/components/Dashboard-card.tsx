import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardCardProps {
  title: string
  value: string
  icon: React.ReactNode
  info?: string
  iconBg?: string // opsional, untuk warna background icon
}

const DashboardCard = ({
  title,
  value,
  icon,
  info,
  iconBg = 'bg-blue-100 text-blue-600', // default biru
}: DashboardCardProps) => {
  return (
    <Card className='transition-all duration-200 hover:scale-[1.03] hover:shadow-lg shadow border-0'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div>
          <CardTitle className='text-xs font-semibold text-gray-500'>
            {title}
          </CardTitle>
        </div>
        <div
          className={`rounded-full p-2 ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-3xl font-bold text-gray-800'>{value}</div>
        {info && <p className='text-xs text-gray-400 mt-1'>{info}</p>}
      </CardContent>
    </Card>
  )
}

export default DashboardCard
