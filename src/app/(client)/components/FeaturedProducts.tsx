import Link from 'next/link'
import { getBestSellingProducts } from '@/app/actions/productAction'
import BestSellingProductCard from './BestSellingProductCard'
import React from 'react'

/**
 * Section "Produk Unggulan" kini Server Component.
 * Data diambil di server sehingga grid sudah terisi pada HTML awal.
 * Optimized untuk LCP dengan prioritas loading gambar critical.
 */
export default async function FeaturedProducts() {
  const { products = [], error } = await getBestSellingProducts(18)

  if (error || !products.length) return null

  const displayProducts = products
    .filter((product) => product.isActive)
    .slice(0, 18)

  if (!displayProducts.length) return null

  return (
    <section className='mb-8'>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Produk Unggulan
          </h2>
          <Link
            href='/kategori'
            className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'
            prefetch={false}>
            Lihat Semua
          </Link>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr'>
          {displayProducts.map((product, index) => (
            <BestSellingProductCard
              key={product.id}
              product={product}
              index={index}
              priority={index < 6} // Prioritas tinggi untuk 6 produk pertama (above the fold)
            />
          ))}
        </div>
      </div>
    </section>
  )
}
