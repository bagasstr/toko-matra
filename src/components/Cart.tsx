import { useCartStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const { getTotalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] p-4'>
        <h2 className='text-2xl font-semibold mb-4'>Your cart is empty</h2>
        <p className='text-muted-foreground text-center'>
          Add some items to your cart to see them here
        </p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-4 sm:py-6 md:py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2'>
          <div className='space-y-3 sm:space-y-4'>
            {items.map((item) => (
              <Card key={item.id} className='p-3 sm:p-4'>
                <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                  {/* Product Image */}
                  <div className='relative w-full sm:w-24 h-24 sm:h-28'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>

                  {/* Product Details */}
                  <div className='flex-1'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                      <div>
                        <h3 className='font-semibold text-base sm:text-lg'>
                          {item.name}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {formatPrice(item.price)} / {item.unit}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0'>
                        {/* Quantity Controls */}
                        <div className='flex items-center gap-1 sm:gap-2'>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-7 w-7 sm:h-8 sm:w-8'
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }>
                            <Minus className='h-3 w-3 sm:h-4 sm:w-4' />
                          </Button>
                          <Input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              onUpdateQuantity(
                                item.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className='w-12 sm:w-16 text-center h-7 sm:h-8'
                          />
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-7 w-7 sm:h-8 sm:w-8'
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }>
                            <Plus className='h-3 w-3 sm:h-4 sm:w-4' />
                          </Button>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 sm:h-8 sm:w-8 text-destructive'
                          onClick={() => onRemoveItem(item.id)}>
                          <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='mt-2 text-right'>
                      <p className='font-semibold text-sm sm:text-base'>
                        Total: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <Card className='p-4 sm:p-6 sticky top-4'>
            <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>
              Order Summary
            </h2>
            <div className='space-y-3 sm:space-y-4'>
              <div className='flex justify-between text-sm sm:text-base'>
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className='flex justify-between text-sm sm:text-base'>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className='border-t pt-3 sm:pt-4'>
                <div className='flex justify-between font-semibold text-sm sm:text-base'>
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
              <Button className='w-full h-9 sm:h-10 text-sm sm:text-base'>
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Cart
