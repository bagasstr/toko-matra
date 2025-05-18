'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllProducts } from '@/app/actions/productAction'
import { getAllCategories } from '@/app/actions/categoryAction'
import { useParams, useRouter } from 'next/navigation'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react'
import { addToCart } from '@/app/actions/cartAction'
import { useCartStore } from '@/hooks/zustandStore'
import { useQuery } from '@tanstack/react-query'
import { validateSession } from '@/app/actions/session'
import { RiWhatsappLine } from '@remixicon/react'
import toRupiah from '@develoka/angka-rupiah-js'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Helper functions for category handling
function getAllCategorySlugs(category) {
  if (!category) return []
  let slugs = [category.slug]
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      slugs = slugs.concat(getAllCategorySlugs(child))
    }
  }
  return slugs
}

function findCategoryBySlug(categories, slug) {
  for (const cat of categories) {
    if (cat.slug === slug) return cat
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryBySlug(cat.children, slug)
      if (found) return found
    }
  }
  return null
}

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

    let slugs = []
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
        slugs.includes(product.category?.slug)
      )
    }
    return allProducts
  }, [allProducts, categories, params.slug])

  // Find the current parent category by slug from params
  const parentCategory = findCategoryBySlug(categories, params.slug[0]) || null

  // Find the current product if we're in product detail view
  const currentProduct = params.slug[2]
    ? filteredProducts?.find((p) => p.slug === params.slug[2])
    : null

  const loading = isLoadingCategories || isLoadingProducts

  return (
    <div className=''>
      <nav
        className={`${
          params.slug.length === 3 ? 'hidden' : ''
        } text-sm text-gray-500 flex gap-2 items-center`}
        aria-label='Breadcrumb'>
        <Link href='/' className='hover:underline text-primary'>
          home
        </Link>
        <span className='mx-1'>/</span>
        <Link href='/kategori' className='hover:underline text-primary'>
          kategori
        </Link>
        <span className='mx-1'>/</span>
        <Link
          href={`/kategori/${params.slug[0]}`}
          className='hover:underline text-primary'>
          {params.slug[0]}
        </Link>
        {params.slug[1] && (
          <Suspense fallback={<div>Loading...</div>}>
            <span className='mx-1'>/</span>
            <Link
              href={`/kategori/${params.slug[0]}/${params.slug[1]}`}
              className='hover:underline text-primary'>
              {params.slug[1]}
            </Link>
          </Suspense>
        )}
        {params.slug[2] && (
          <Suspense fallback={<div>Loading...</div>}>
            <span className='mx-1'>/</span>
            <span className='text-gray-700 font-medium'>{params.slug[2]}</span>
          </Suspense>
        )}
      </nav>
      {params.slug.length === 1 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <SubCategoryPage
            parentCategory={parentCategory}
            allProducts={allProducts}
            loading={loading}
          />
        </Suspense>
      ) : params.slug.length === 2 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductPage
            products={filteredProducts}
            parentCategory={parentCategory}
            loading={loading}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductDetailPage
            product={currentProduct}
            parentCategory={parentCategory}
            loading={loading}
            allProducts={allProducts}
          />
        </Suspense>
      )}
    </div>
  )
}

export default CategoryPage

function SubCategoryPage({
  parentCategory,
  allProducts,
  loading,
}: {
  parentCategory: any
  allProducts: any[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
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

  // Only show subcategories that have at least 1 active product
  const subCategoriesWithProducts = parentCategory.children?.filter((cat) => {
    const allSlugs = [
      cat.slug,
      ...(cat.children?.map((child) => child.slug) || []),
    ]
    const count = allProducts.filter(
      (p) => p.isActive && allSlugs.includes(p.category?.slug)
    ).length
    return count > 0
  })

  if (subCategoriesWithProducts.length === 0) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Tidak ada produk dalam subkategori ini.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
      {subCategoriesWithProducts.map((cat) => {
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

function ProductPage({
  products,
  parentCategory,
  loading,
}: {
  products: any[]
  parentCategory: any
  loading: boolean
}) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
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

  const activeProducts = products.filter(
    (product) => product.isActive && product.isFeatured
  )

  if (activeProducts.length === 0) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Tidak ada produk aktif.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {activeProducts.map((product) => (
        <Link
          href={`/kategori/${parentCategory.slug}/${product.category.slug}/${product.slug}`}
          key={product.id}
          className='group bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden'>
          <div className='relative w-full h-40'>
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.name}
              fill
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-contain group-hover:scale-105 transition'
            />
          </div>
          <div className='p-4'>
            <Badge variant='secondary'>{product.brand || 'No Brand'}</Badge>
            <h3 className='font-medium text-gray-900 line-clamp-2 my-2'>
              {product.name}
            </h3>
            <div className='flex items-center justify-between'>
              <p className='text-primary font-semibold'>
                Rp {product.price?.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// Helper function to calculate total product amount based on quantity
function calculateTotalAmount(
  quantity: number,
  minOrder: number,
  multiOrder: number
): number {
  if (quantity <= 0) return 0
  if (quantity === 1) return minOrder

  return minOrder + multiOrder * (quantity - 1)
}

function ProductDetailPage({
  product,
  parentCategory,
  loading,
  allProducts,
}: {
  product: any
  parentCategory: any
  loading: boolean
  allProducts: any[]
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isReadMore, setIsReadMore] = useState(false)
  const [cartMessage, setCartMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart: addToCartStore, fetchCart } = useCartStore()

  // Calculate actual quantity based on minOrder and multiOrder
  const calculateActualQuantity = (inputQuantity: number) => {
    if (inputQuantity <= 0) return 0
    if (inputQuantity === 1) return product.minOrder
    return product.minOrder + product.multiOrder * (inputQuantity - 1)
  }

  const handleBuyNow = async () => {
    if (!product) return

    try {
      setIsAddingToCart(true)

      const session = await validateSession()
      if (!session) {
        setCartMessage({
          type: 'error',
          message: 'Silakan login terlebih dahulu',
        })
        return
      }

      const result = await addToCart({
        userId: session.user.id,
        productId: product.id,
        quantity: calculateActualQuantity(quantity),
      })

      if (result.success) {
        addToCartStore({
          id: product.id,
          product: {
            id: product.id,
            name: product.name,
            images: product.images,
            price: product.price,
            unit: product.unit,
          },
          quantity: calculateActualQuantity(quantity),
        })

        // Navigate to checkout page
        router.push('/keranjang/pembayaran')
      } else {
        setCartMessage({
          type: 'error',
          message: 'Gagal menambahkan produk ke keranjang',
        })
      }
    } catch (error) {
      setCartMessage({
        type: 'error',
        message: 'Terjadi kesalahan saat menambahkan ke keranjang',
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      setIsAddingToCart(true)
      setCartMessage(null)

      const session = await validateSession()
      if (!session) {
        setCartMessage({
          type: 'error',
          message: 'Silakan login terlebih dahulu',
        })
        return
      }

      const result = await addToCart({
        userId: session.user.id,
        productId: product.id,
        quantity: calculateActualQuantity(quantity),
      })

      if (result.success) {
        addToCartStore({
          id: product.id,
          product: {
            id: product.id,
            name: product.name,
            images: product.images,
            price: product.price,
            unit: product.unit,
          },
          quantity: calculateActualQuantity(quantity),
        })

        await fetchCart()

        setCartMessage({
          type: 'success',
          message: 'Produk berhasil ditambahkan ke keranjang',
        })
        setQuantity(product.minOrder)
      } else {
        setCartMessage({
          type: 'error',
          message: 'Gagal menambahkan produk ke keranjang',
        })
      }
    } catch (error) {
      setCartMessage({
        type: 'error',
        message: 'Terjadi kesalahan saat menambahkan ke keranjang',
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const relatedProducts = allProducts
    ? allProducts
        .filter(
          (p) =>
            p.category?.id === product?.category?.id && p.id !== product?.id
        )
        .slice(0, 6) // Limit to 6 related products
    : []

  if (loading || !product) {
    return (
      <div className='animate-pulse'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='w-full h-[400px] bg-gray-200 rounded-lg' />
          <div className='space-y-4'>
            <div className='h-8 w-3/4 bg-gray-200 rounded' />
            <div className='h-4 w-1/2 bg-gray-200 rounded' />
            <div className='h-4 w-full bg-gray-200 rounded' />
            <div className='h-4 w-full bg-gray-200 rounded' />
            <div className='h-4 w-2/3 bg-gray-200 rounded' />
          </div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Produk tidak ditemukan.
      </div>
    )
  }

  return (
    <div className=''>
      <div className='flex flex-col lg:flex-row lg:items-start gap-4'>
        {/* Left Column - Product Images */}
        <div className='space-y-4 lg:flex-4/1 lg:sticky lg:top-24'>
          <div className='relative aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] lg:aspect-[2/1] w-full overflow-hidden'>
            <Image
              src={product.images[selectedImage] || '/placeholder.png'}
              alt={product.name}
              fill
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-contain p-4'
            />
          </div>
          {product.images.length > 1 && (
            <div className='grid grid-cols-5 gap-2'>
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-[3/2] overflow-hidden cursor-pointer ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}>
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className='object-contain p-2'
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Column - Product Info */}
        <div className='space-y-6'>
          <div className=''>
            <div className=''>
              <p className='text-sm text-gray-500 mb-2'>
                {product.brand || 'No Brand'}
              </p>
              <p className='text-2xl font-semibold mb-2'>{product.name}</p>
              <p className='text-primary text-xl font-semibold'>
                {toRupiah(product.price, { floatingPoint: 0 })}
              </p>
            </div>
            <div className=''>
              <div className='py-8'>
                <h4 className='text-base font-semibold mb-4'>Detail Produk</h4>
                <p className='text-sm grid grid-cols-2'>
                  <span className=''>Satuan</span>
                  <span className='text-muted-foreground'>{product.unit}</span>
                </p>
                <Separator />
                <p className='text-sm mt-2 grid grid-cols-2'>
                  <span className=''>Minimal Pembelian</span>
                  <span className='text-muted-foreground'>
                    {product.minOrder} {product.unit}
                  </span>
                </p>
                <Separator />
                <p className='text-sm mt-2 grid grid-cols-2'>
                  <span className=''>Kelipatan Pembelian</span>
                  <span className='text-muted-foreground'>
                    {product.multiOrder} {product.unit}
                  </span>
                </p>
                <Separator />
                <p className='text-sm mt-2 grid grid-cols-2'>
                  <span className=''>Dimensi</span>
                  <span className='text-muted-foreground'>
                    {product.dimensions}
                  </span>
                </p>
                <Separator />
                <p className='text-sm mt-2 grid grid-cols-2'>
                  <span className=''>Merek</span>
                  <span className='text-muted-foreground'>
                    {product.brand || 'No Brand'}
                  </span>
                </p>
                <Separator />
                <p className='text-sm mt-2 grid grid-cols-2'>
                  <span className=''>Kategori</span>
                  <span className='text-muted-foreground'>
                    {product.category.name}
                  </span>
                </p>
                <Separator />
              </div>
              <div className='space-y-2'>
                <h4 className='text-base font-semibold mb-4'>Deskripsi</h4>
                <p className='text-sm text-muted-foreground line-clamp-3'>
                  {product.description}
                </p>
              </div>
            </div>
            <Button
              variant='link'
              className='w-full justify-end'
              onClick={() => setIsModalOpen(true)}>
              Baca Selengkapnya
            </Button>
            <Link
              href='https://wa.me/6281234567890'
              className='text-muted-foreground lg:hidden'>
              <Button variant='outline' className='text-sm w-full mt-4'>
                <RiWhatsappLine size={20} className='mr-1' /> Hubungi CS untuk
                detail produk ini
              </Button>
            </Link>
          </div>
          {cartMessage && (
            <div
              className={`p-3 rounded-lg ${
                cartMessage.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
              {cartMessage.message}
            </div>
          )}
        </div>

        {/* Right Column - Desktop Action Bar */}
        <div className='hidden lg:block lg:flex-2/1 p-4 lg:sticky lg:top-24'>
          <div className='lg:border lg:p-4 lg:rounded-lg'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col mb-2 gap-y-1.5'>
                {' '}
                <span className='text-sm font-medium'>Jumlah:</span>{' '}
                <div className='flex items-center gap-2'>
                  {' '}
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    {' '}
                    -{' '}
                  </Button>{' '}
                  <input
                    type='number'
                    value={quantity || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value) && value > 0) {
                        setQuantity(value)
                      }
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value)
                      if (isNaN(value) || value < 1) {
                        setQuantity(1)
                      }
                    }}
                    className='w-16 text-center border rounded-md px-2 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    min='1'
                  />{' '}
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setQuantity(quantity + 1)}>
                    {' '}
                    +{' '}
                  </Button>{' '}
                  <span className='text-sm'>X {product.unit}</span>{' '}
                </div>{' '}
                <span className='text-xs'>
                  {' '}
                  {`*Penjelasan jumlah pembelian:                   1 = ${
                    product.minOrder
                  } ${product.unit},                   2 = ${
                    product.minOrder + product.multiOrder
                  } ${product.unit},                   3 = ${
                    product.minOrder + product.multiOrder * 2
                  } ${product.unit}, dst.`}{' '}
                </span>{' '}
              </div>{' '}
              <div className='flex items-center justify-between mb-4'>
                {' '}
                <span className='text-sm font-medium'>Subtotal:</span>{' '}
                <span className='text-lg font-semibold text-primary'>
                  {' '}
                  {toRupiah(product.price * calculateActualQuantity(quantity), {
                    floatingPoint: 0,
                  })}{' '}
                </span>{' '}
              </div>
              <Button
                variant='outline'
                className='w-full py-6 px-8'
                onClick={handleAddToCart}
                disabled={isAddingToCart}>
                {' '}
                {isAddingToCart ? 'Menambahkan...' : 'Keranjang'}{' '}
              </Button>{' '}
              <Button
                className='w-full py-6 px-8'
                onClick={handleBuyNow}
                disabled={isAddingToCart}>
                {' '}
                {isAddingToCart ? 'Memproses...' : 'Beli Sekarang'}{' '}
              </Button>
              <Link
                href='https://wa.me/6281234567890'
                className='hidden lg:block'>
                <Button variant='outline' className='text-sm w-full mt-4'>
                  <RiWhatsappLine size={20} className='mr-1' /> Hubungi CS untuk
                  detail produk ini
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Fixed Bottom Bar */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-4 md:px-8 z-50'>
        <div className='max-w-7xl mx-auto flex items-center justify-between gap-4'>
          <Button
            variant='outline'
            className='flex-1 py-6 px-8'
            onClick={handleAddToCart}
            disabled={isAddingToCart}>
            {' '}
            {isAddingToCart ? 'Menambahkan...' : 'Keranjang'}{' '}
          </Button>{' '}
          <Button
            className='flex-1 py-6 px-8'
            onClick={handleBuyNow}
            disabled={isAddingToCart}>
            {' '}
            {isAddingToCart ? 'Memproses...' : 'Beli Sekarang'}{' '}
          </Button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className='mt-12'>
          <h3 className='text-lg font-semibold mb-4'>Produk Terkait</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/kategori/${item.category.slug}/${item.slug}`}
                className='block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden'>
                <div className='relative w-full h-32'>
                  <Image
                    src={item.images[0] || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='p-2'>
                  <div className='text-xs text-gray-500 mb-1'>
                    {item.brand || 'No Brand'}
                  </div>
                  <div className='font-medium text-sm line-clamp-2'>
                    {item.name}
                  </div>
                  <div className='text-primary font-semibold text-sm mt-1'>
                    {toRupiah(item.price, { floatingPoint: 0 })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modal for full description */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-none max-h-[90vh] translate-y-[-43%]'>
          <DialogHeader>
            <DialogTitle>Detail Produk</DialogTitle>
          </DialogHeader>
          <div className='overflow-y-auto h-[80vh] w-full scrollbar-hide'>
            <div className='py-8'>
              <h4 className='text-base font-semibold mb-4'>Detail Produk</h4>
              <p className='text-sm grid grid-cols-2'>
                <span className=''>Satuan</span>
                <span className='text-muted-foreground'>{product.unit}</span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Minimal Pembelian</span>
                <span className='text-muted-foreground'>
                  {product.minOrder} {product.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kelipatan Pembelian</span>
                <span className='text-muted-foreground'>
                  {product.multiOrder} {product.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Dimensi</span>
                <span className='text-muted-foreground'>
                  {product.dimensions}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Merek</span>
                <span className='text-muted-foreground'>
                  {product.brand || 'No Brand'}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kategori</span>
                <span className='text-muted-foreground'>
                  {product.category.name}
                </span>
              </p>
              <Separator />
            </div>
            <div className='space-y-2'>
              <h4 className='text-base font-semibold mb-4'>Deskripsi</h4>
              <p className='text-sm text-muted-foreground line-clamp-1'>
                {product.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
