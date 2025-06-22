'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { Category, Product } from '../types'
import { ProductCard } from './ProductCard'

interface ProductPageProps {
  products: Product[]
  parentCategory: Category
  loading: boolean
}

export function ProductPage({
  products,
  parentCategory,
  loading,
}: ProductPageProps) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await validateSession()
      setSession(userSession)
    }
    fetchSession()
  }, [])

  const { mutate: addToCartMutation, isPending: isAddingToCart } = useMutation({
    mutationFn: addToCart,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Produk ditambahkan ke keranjang')
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } else {
        toast.error(result.error || 'Gagal menambahkan produk')
      }
    },
    onError: (error) => {
      toast.error('Terjadi kesalahan: ' + error.message)
    },
  })

  const handleAddToCart = (product: Product) => {
    if (!session?.user?.id) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    addToCartMutation({
      userId: session.user.id,
      productId: product.id,
      quantity: product.minOrder || 1,
    })
  }

  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className='animate-pulse bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='w-full h-40 bg-gray-200' />
            <div className='p-4'>
              <div className='h-4 w-20 bg-gray-200 rounded mb-2' />
              <div className='h-5 w-32 bg-gray-300 rounded mb-2' />
              <div className='h-4 w-16 bg-gray-100 rounded' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className='text-center text-gray-400 py-10'>Tidak ada produk.</div>
    )
  }

  // Filter only active products (remove isFeatured requirement for category pages)
  const activeProducts = products.filter((product) => product.isActive)

  if (activeProducts.length === 0) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Tidak ada produk aktif.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {activeProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          href={`/kategori/${parentCategory.slug}/${product.category?.slug}/${product.slug}`}
          showBrand={true}
        />
      ))}
    </div>
  )
}
