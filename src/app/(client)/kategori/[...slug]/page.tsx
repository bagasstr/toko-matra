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

  const slugs = params.slug as string[]

  // Determine current product slug for both 2-segment and 3-segment routes
  const maybeProductSlug = useMemo(() => {
    if (slugs.length === 3) return slugs[2]
    if (slugs.length === 2) return slugs[1]
    return null
  }, [slugs])

  // Current product if URL points to a product slug (supports 2 or 3 segments)
  const currentProduct = useMemo(() => {
    if (!allProducts || !maybeProductSlug) return null
    return allProducts.find((p) => p.slug === maybeProductSlug) || null
  }, [allProducts, maybeProductSlug])

  // Filter products based on category slugs (skip when in product detail)
  const filteredProducts = useMemo(() => {
    if (!allProducts || !categories.length) return []
    if (currentProduct) return allProducts

    let selectedSlugs: string[] = []
    if (slugs[1]) {
      const parentCat = findCategoryBySlug(categories, slugs[0])
      const subCat = parentCat?.children?.find((cat) => cat.slug === slugs[1])
      selectedSlugs = getAllCategorySlugs(subCat)
    } else if (slugs[0]) {
      const parentCat = findCategoryBySlug(categories, slugs[0])
      selectedSlugs = getAllCategorySlugs(parentCat)
    }

    if (selectedSlugs.length > 0) {
      return allProducts.filter((product) =>
        selectedSlugs.includes(product.category?.slug || '')
      )
    }
    return allProducts
  }, [allProducts, categories, slugs, currentProduct])

  // Find the current parent category by slug from params
  const parentCategory = findCategoryBySlug(categories, slugs[0]) || null

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
        slugs={slugs}
        isProductDetail={
          slugs.length === 3 || (slugs.length === 2 && !!currentProduct)
        }
      />

      {slugs.length === 1 && (parentCategory?.children?.length || 0) > 0 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <SubCategoryPage
            parentCategory={parentCategory as Category}
            allProducts={allProducts}
            loading={loading}
          />
        </Suspense>
      ) : slugs.length === 1 || (slugs.length === 2 && !currentProduct) ? (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductPage
            products={filteredProducts}
            parentCategory={parentCategory as Category}
            loading={loading}
          />
        </Suspense>
      ) : (
        // Product detail page
        <ProductDetailPage
          product={safeCurrentProduct as unknown as Product}
          loading={loading}
        />
      )}

      <RelatedProducts relatedProducts={relatedProducts} />
    </div>
  )
}

export default CategoryPage
