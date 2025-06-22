'use client'

import { useParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllProducts } from '@/app/actions/productAction'
import { getAllCategories } from '@/app/actions/categoryAction'
import { Category, Product } from '../types'
import { findCategoryBySlug, getAllCategorySlugs } from '../utils'
import {
  Breadcrumb,
  SubCategoryPage,
  ProductPage,
  ProductDetailPage,
  RelatedProducts,
} from '../components'

function CategoryPage() {
  const params = useParams()

  // Fetch categories using React Query
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { categorie, success, error } = await getAllCategories()
      if (!success) {
        console.log(error)
        return []
      }
      return categorie
    },
  })

  // Fetch products using React Query
  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { products, success, error } = await getAllProducts()
      if (!success) {
        console.log(error)
        return []
      }
      return products
    },
    enabled: categories.length > 0,
  })

  // Filter products based on category slugs
  const filteredProducts = useMemo(() => {
    if (!allProducts || !categories.length) return []

    // If product detail page, return all products
    if (params.slug[2]) return allProducts

    let slugs: string[] = []
    if (params.slug[1]) {
      const parentCat = findCategoryBySlug(categories, params.slug[0])
      const subCat = parentCat?.children?.find(
        (cat) => cat.slug === params.slug[1]
      )
      slugs = getAllCategorySlugs(subCat)
    } else if (params.slug[0]) {
      const parentCat = findCategoryBySlug(categories, params.slug[0])
      slugs = getAllCategorySlugs(parentCat)
    }

    if (slugs.length > 0) {
      return allProducts.filter((product) =>
        slugs.includes(product.category?.slug || '')
      )
    }
    return allProducts
  }, [allProducts, categories, params.slug])

  // Find the current parent category by slug from params
  const parentCategory = findCategoryBySlug(categories, params.slug[0]) || null

  // Find the current product if we're in product detail view
  const currentProduct = params.slug[2]
    ? filteredProducts?.find((p) => p.slug === params.slug[2]) || null
    : null

  // Ensure currentProduct is properly structured
  const safeCurrentProduct = currentProduct
    ? {
        ...currentProduct,
        category: currentProduct.category
          ? {
              name: currentProduct.category.name || 'Tidak Dikategorikan',
              slug: currentProduct.category.slug || '',
            }
          : { name: 'Tidak Dikategorikan', slug: '' },
        images: currentProduct.images || [],
        brand: currentProduct.brand
          ? {
              id: currentProduct.brand.id || '',
              name: currentProduct.brand.name || 'No Brand',
            }
          : { id: '', name: 'No Brand' },
        price: currentProduct.price || 0,
        minOrder: currentProduct.minOrder || 1,
        multiOrder: currentProduct.multiOrder || 1,
        unit: currentProduct.unit || '',
        description: currentProduct.description || '',
        dimensions: currentProduct.dimensions || '',
        label: currentProduct.label || null,
      }
    : null

  const loading = isLoadingCategories || isLoadingProducts

  // Produk terkait berdasarkan parent kategori
  const relatedProducts = allProducts
    ? allProducts
        .filter(
          (p) =>
            p.id !== currentProduct?.id &&
            p.category?.parentId ===
              (currentProduct?.category as any)?.parentId &&
            p.isActive
        )
        .slice(0, 6)
    : []

  return (
    <div className=''>
      <Breadcrumb
        slugs={params.slug as string[]}
        isProductDetail={(params.slug as string[]).length === 3}
      />

      {params.slug.length === 1 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <SubCategoryPage
            parentCategory={parentCategory as Category}
            allProducts={allProducts}
            loading={loading}
          />
        </Suspense>
      ) : params.slug.length === 2 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductPage
            products={filteredProducts}
            parentCategory={parentCategory as Category}
            loading={loading}
          />
        </Suspense>
      ) : (
        <ProductDetailPage
          product={safeCurrentProduct as unknown as Product}
          parentCategory={parentCategory as Category}
          loading={loading}
          allProducts={allProducts}
        />
      )}

      <RelatedProducts relatedProducts={relatedProducts} />
    </div>
  )
}

export default CategoryPage
