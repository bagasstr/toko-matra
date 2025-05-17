import React, { useState } from 'react'
import { Product } from '../types/product'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface ProductDetailProps {
  product: Product
  onAddToCart: (product: Product) => void
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value))
  }

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8'>
        {/* Product Image */}
        <div className='relative aspect-square w-full overflow-hidden rounded-lg'>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, 50vw'
            priority
          />
        </div>

        {/* Product Info */}
        <div className='flex flex-col space-y-4 sm:space-y-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
              {product.name}
            </h1>
            <p className='text-2xl sm:text-3xl font-semibold text-primary'>
              {formatPrice(product.price)}
            </p>
          </div>

          <div className='space-y-2'>
            <h2 className='text-lg sm:text-xl font-semibold'>Description</h2>
            <p className='text-sm sm:text-base text-muted-foreground'>
              {product.description}
            </p>
          </div>

          <div className='space-y-2'>
            <h2 className='text-lg sm:text-xl font-semibold'>Specifications</h2>
            <Card className='p-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Category</p>
                  <p className='font-medium'>{product.category}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Unit</p>
                  <p className='font-medium'>{product.unit}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Stock</p>
                  <p className='font-medium'>{product.stock}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>SKU</p>
                  <p className='font-medium'>{product.sku}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={() => handleQuantityChange(quantity - 1)}>
                <Minus className='h-4 w-4' />
              </Button>
              <Input
                type='number'
                min='1'
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className='w-16 text-center'
              />
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8'
                onClick={() => handleQuantityChange(quantity + 1)}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <Button
              className='w-full h-10 sm:h-11 text-base'
              onClick={() => onAddToCart({ ...product, quantity })}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
