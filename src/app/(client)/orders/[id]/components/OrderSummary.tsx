import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderSummaryProps {
  subtotal: number
  ppn: number
  total: number
}

export const OrderSummary = memo(
  ({ subtotal, ppn, total }: OrderSummaryProps) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>PPN (11%)</span>
              <span>Rp {ppn.toLocaleString('id-ID')}</span>
            </div>
            <div className='flex justify-between border-t pt-3 font-bold'>
              <span>Total</span>
              <span className='text-primary'>
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

OrderSummary.displayName = 'OrderSummary'
