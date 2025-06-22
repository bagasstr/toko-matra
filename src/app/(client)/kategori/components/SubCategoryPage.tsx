'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { Category, Product } from '../types'

interface SubCategoryPageProps {
  parentCategory: Category
  allProducts: Product[]
  loading: boolean
}

export function SubCategoryPage({
  parentCategory,
  allProducts,
  loading,
}: SubCategoryPageProps) {
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

  // Handler for adding to cart (if needed in this component)
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
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className='animate-pulse flex flex-col items-center border rounded-xl bg-white shadow-sm overflow-hidden p-5 text-center'>
            <div className='h-6 w-24 bg-gray-200 rounded mb-3' />
            <div className='h-4 w-16 bg-gray-100 rounded' />
          </div>
        ))}
      </div>
    )
  }

  if (!parentCategory) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Kategori tidak ditemukan.
      </div>
    )
  }

  // Log for debugging if needed
  if (process.env.NODE_ENV === 'development') {
    console.log('SubCategoryPage debug:', {
      categoryName: parentCategory?.name,
      subcategoriesCount: parentCategory?.children?.length || 0,
      productsCount: allProducts.length,
    })
  }

  // Only show subcategories that have at least 1 active product
  const subCategoriesWithProducts = parentCategory.children?.filter((cat) => {
    const allSlugs = [
      cat.slug,
      ...(cat.children?.map((child) => child.slug) || []),
    ]
    const count = allProducts.filter(
      (p) => p.isActive && allSlugs.includes(p.category?.slug)
    ).length

    // Log category product count in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${cat.name}: ${count} products`)
    }

    return count > 0
  })

  // Show all subcategories if no products found but subcategories exist
  const displayCategories =
    subCategoriesWithProducts?.length > 0
      ? subCategoriesWithProducts
      : parentCategory.children

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Tidak ada subkategori dalam kategori ini.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
      {displayCategories.map((cat) => {
        const allSlugs = [
          cat.slug,
          ...(cat.children?.map((child) => child.slug) || []),
        ]
        const count = allProducts.filter(
          (p) => p.isActive && allSlugs.includes(p.category?.slug)
        ).length

        return (
          <Link
            href={`/kategori/${parentCategory.slug}/${cat.slug}`}
            key={cat.id}
            className='group flex flex-col items-center border rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden p-5 text-center hover:border-primary'>
            <div className='flex flex-col items-center gap-2 flex-1 justify-center'>
              <h2 className='font-semibold text-lg text-gray-900 group-hover:text-primary transition'>
                {cat.name}
              </h2>
              <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mt-1'>
                {count} produk
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
