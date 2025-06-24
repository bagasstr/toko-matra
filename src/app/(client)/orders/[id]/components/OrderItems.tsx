import { memo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    images: string[]
  }
}

interface OrderItemsProps {
  items: OrderItem[]
}

const OrderItemCard = memo(
  ({
    item,
    index,
    isLast,
  }: {
    item: OrderItem
    index: number
    isLast: boolean
  }) => (
    <div
      className={`flex flex-col sm:flex-row gap-4 ${
        !isLast ? 'border-b border-gray-200 pb-4' : ''
      }`}>
      <div className='shrink-0'>
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          width={60}
          height={60}
          className='object-cover rounded-lg bg-gray-100 border'
          priority={index < 3}
          loading={index < 3 ? 'eager' : 'lazy'}
        />
      </div>
      <div className='flex-1 min-w-0'>
        <h4 className='font-semibold text-gray-900 mb-2 line-clamp-2'>
          {item.product.name}
        </h4>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div className='text-sm text-gray-600'>
            {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
          </div>
          <div className='font-bold text-lg'>
            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  )
)

OrderItemCard.displayName = 'OrderItemCard'

export const OrderItems = memo(({ items }: OrderItemsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pesanan ({items.length} item)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {items.map((item, index) => (
            <OrderItemCard
              key={item.id}
              item={item}
              index={index}
              isLast={index === items.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

OrderItems.displayName = 'OrderItems'
