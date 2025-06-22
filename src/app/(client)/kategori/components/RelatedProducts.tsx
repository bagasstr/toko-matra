'use client'

import { Product } from '../types'
import { getCategorySlug } from '../utils'
import { ProductCard } from './ProductCard'

interface RelatedProductsProps {
  relatedProducts: Product[]
}

export function RelatedProducts({ relatedProducts }: RelatedProductsProps) {
  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className='mt-12'>
      <h3 className='text-lg font-semibold mb-4'>Produk Terkait</h3>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {relatedProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            href={`/kategori/${getCategorySlug(item.category)}/${item.slug}`}
            showBrand={true}
          />
        ))}
      </div>
    </div>
  )
}
