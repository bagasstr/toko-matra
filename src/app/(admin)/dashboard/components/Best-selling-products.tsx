'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function BestSellingProducts() {
  const products = [
    {
      name: 'Semen Portland 50kg',
      sales: 120,
      percentage: 28,
    },
    {
      name: 'Besi Beton 10mm',
      sales: 85,
      percentage: 20,
    },
    {
      name: 'Pasir Cor 1 Truk',
      sales: 65,
      percentage: 15,
    },
    {
      name: 'Batu Split 1 Truk',
      sales: 45,
      percentage: 10,
    },
    {
      name: 'Cat Tembok 20L',
      sales: 35,
      percentage: 8,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>
          Produk dengan penjualan tertinggi bulan ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {products.map((product) => (
            <div key={product.name} className='flex items-center'>
              <div className='w-full'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium'>{product.name}</span>
                  <span className='text-sm text-muted-foreground'>
                    {product.sales} terjual
                  </span>
                </div>
                <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary'
                    style={{ width: `${product.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
