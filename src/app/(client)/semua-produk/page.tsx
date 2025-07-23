'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAllProducts, searchProducts } from '@/app/actions/productAction'
import { getAllCategories } from '@/app/actions/categoryAction'
import { addToCart } from '@/app/actions/cartAction'
import { useSessionStore } from '@/hooks/zustandStore'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '../kategori/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  Filter,
  Grid3X3,
  Grid2X2,
  SortAsc,
  SortDesc,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
  label: string
  isFeatured: boolean
  isActive: boolean
  minOrder?: number
  multiOrder?: number
  unit?: string
  description?: string
  category: {
    id: string
    name: string
    slug: string
    parentId?: string
  }
  brand?: {
    id: string
    name: string
    slug: string
    logo?: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  children?: Category[]
}

const ITEMS_PER_PAGE = 24
const GRID_LAYOUTS = [
  {
    value: '4',
    icon: Grid2X2,
    cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  },
  {
    value: '6',
    icon: Grid3X3,
    cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  },
] as const

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-low', label: 'Harga Terendah' },
  { value: 'price-high', label: 'Harga Tertinggi' },
  { value: 'name-asc', label: 'Nama A-Z' },
  { value: 'name-desc', label: 'Nama Z-A' },
  { value: 'featured', label: 'Produk Unggulan' },
] as const

const PRICE_RANGES = [
  { value: 'all', label: 'Semua Harga' },
  { value: '0-100000', label: 'Di bawah Rp 100rb' },
  { value: '100000-500000', label: 'Rp 100rb - 500rb' },
  { value: '500000-1000000', label: 'Rp 500rb - 1jt' },
  { value: '1000000-5000000', label: 'Rp 1jt - 5jt' },
  { value: '5000000-999999999', label: 'Di atas Rp 5jt' },
] as const

// Loading skeleton component
const ProductsSkeleton = ({ gridLayout }: { gridLayout: string }) => (
  <div
    className={cn(
      'grid gap-4 auto-rows-fr',
      GRID_LAYOUTS.find((l) => l.value === gridLayout)?.cols ||
        GRID_LAYOUTS[1].cols
    )}>
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <Card key={index} className='overflow-hidden'>
        <CardContent className='p-0'>
          <Skeleton className='w-full aspect-square' />
          <div className='p-4 space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-5 w-1/2' />
            <div className='flex justify-between items-center'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-8 w-20' />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        )
      }
    }

    return pages
  }

  return (
    <div className='flex items-center justify-center space-x-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {getVisiblePages().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className='px-2'>...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => onPageChange(page as number)}
              className='min-w-[40px]'>
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}

const AllProductsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { userId, isLoggedIn } = useSessionStore()

  // State management from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [priceRange, setPriceRange] = useState(
    searchParams.get('price') || 'all'
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [gridLayout, setGridLayout] = useState('6')
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  )
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Sync URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (params.get('search')) setSearchQuery(params.get('search') || '')
    if (params.get('category'))
      setSelectedCategory(params.get('category') || 'all')
    if (params.get('price')) setPriceRange(params.get('price') || 'all')
    if (params.get('sort')) setSortBy(params.get('sort') || 'newest')
    if (params.get('page')) setCurrentPage(parseInt(params.get('page') || '1'))
  }, [searchParams])

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await getAllCategories()
      if (result.success) {
        return result?.categorie || []
      }
      return []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch products with search and filter
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'allProducts',
      debouncedSearchQuery,
      selectedCategory,
      sortBy,
      priceRange,
      currentPage,
    ],
    queryFn: async () => {
      if (debouncedSearchQuery.trim()) {
        const result = await searchProducts(debouncedSearchQuery, {
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          isActive: true,
        })
        return result
      } else {
        const result = await getAllProducts({
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          isActive: true,
        })
        return {
          success: result.success,
          products: result.products || [],
          totalCount: result.products?.length || 0,
          hasMore: (result.products?.length || 0) === ITEMS_PER_PAGE,
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.products) return []

    let products = [...productsData.products]

    // Filter by category if not using search
    if (!debouncedSearchQuery.trim() && selectedCategory !== 'all') {
      products = products.filter(
        (product) =>
          product.category?.id === selectedCategory ||
          product.category?.parentId === selectedCategory
      )
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      products = products.filter(
        (product) => product.price >= min && product.price <= max
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        products.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'featured':
        products.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return b.id.localeCompare(a.id)
        })
        break
      case 'oldest':
        products.sort((a, b) => a.id.localeCompare(b.id))
        break
      case 'newest':
      default:
        products.sort((a, b) => b.id.localeCompare(a.id))
        break
    }

    return products
  }, [
    productsData?.products,
    selectedCategory,
    sortBy,
    priceRange,
    debouncedSearchQuery,
  ])

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => {
      if (!userId) {
        throw new Error('Silakan login terlebih dahulu')
      }
      return await addToCart(productId, quantity)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Produk ditambahkan ke keranjang')
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } else {
        toast.error(result.error || 'Gagal menambahkan produk')
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    },
  })

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    updateURL({ search: value, page: '1' })
  }, [])

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
    updateURL({ category: categoryId, page: '1' })
  }, [])

  const handlePriceFilter = useCallback((range: string) => {
    setPriceRange(range)
    setCurrentPage(1)
    updateURL({ price: range, page: '1' })
  }, [])

  const handleSort = useCallback((sortValue: string) => {
    setSortBy(sortValue)
    updateURL({ sort: sortValue })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    updateURL({ page: page.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '1') {
          newSearchParams.set(key, value)
        } else {
          newSearchParams.delete(key)
        }
      })

      const newUrl = `/semua-produk${
        newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''
      }`
      router.replace(newUrl, { scroll: false })
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('newest')
    setCurrentPage(1)
    router.replace('/semua-produk')
  }, [router])

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (!isLoggedIn) {
        toast.error('Silakan login terlebih dahulu')
        router.push('/login')
        return
      }
      addToCartMutation.mutate({
        productId: product.id,
        quantity: product.minOrder || 1,
      })
    },
    [isLoggedIn, addToCartMutation, router]
  )

  // Calculate pagination
  const totalProducts =
    productsData?.totalCount || filteredAndSortedProducts.length
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)
  const hasFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    priceRange !== 'all' ||
    sortBy !== 'newest'

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-6'>
        {/* Breadcrumb */}
        <nav className='mb-4 text-sm text-gray-500 flex gap-2 items-center'>
          <Link href='/' className='hover:underline text-primary'>
            Beranda
          </Link>
          <span className='mx-1'>/</span>
          <span className='text-gray-700'>Semua Produk</span>
        </nav>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
            Semua Produk
          </h1>
          <p className='text-gray-600'>
            Temukan produk bahan bangunan berkualitas untuk kebutuhan proyek
            Anda
          </p>
        </div>

        {/* Search and Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {/* Search Bar */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Cari produk, kategori, atau merek...'
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className='pl-10 pr-10 h-12'
                />
                {searchQuery && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => handleSearch('')}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0'>
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {/* Mobile Filters Toggle */}
              <div className='md:hidden'>
                <Button
                  variant='outline'
                  onClick={() => setShowFilters(!showFilters)}
                  className='w-full'>
                  <Filter className='h-4 w-4 mr-2' />
                  {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                </Button>
              </div>

              {/* Filters Row */}
              <div
                className={cn(
                  'space-y-4 md:space-y-0 md:flex md:flex-row md:gap-4 md:justify-between md:items-center',
                  showFilters ? 'block' : 'hidden md:flex'
                )}>
                <div className='flex flex-col md:flex-row gap-4 flex-1'>
                  {/* Category Filter */}
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryFilter}>
                    <SelectTrigger className='w-full md:w-48'>
                      <SelectValue placeholder='Pilih kategori' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Semua Kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Range Filter */}
                  <Select value={priceRange} onValueChange={handlePriceFilter}>
                    <SelectTrigger className='w-full md:w-48'>
                      <SelectValue placeholder='Rentang harga' />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Filter */}
                  <Select value={sortBy} onValueChange={handleSort}>
                    <SelectTrigger className='w-full md:w-48'>
                      <SelectValue placeholder='Urutkan' />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasFilters && (
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='whitespace-nowrap'>
                      <X className='h-4 w-4 mr-2' />
                      Hapus Filter
                    </Button>
                  )}
                </div>

                {/* Grid Layout Toggle */}
                <div className='flex items-center gap-2'>
                  {GRID_LAYOUTS.map((layout) => (
                    <Button
                      key={layout.value}
                      variant={
                        gridLayout === layout.value ? 'default' : 'outline'
                      }
                      size='sm'
                      onClick={() => setGridLayout(layout.value)}
                      className='p-2'>
                      <layout.icon className='h-4 w-4' />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {hasFilters && (
                <div className='flex flex-wrap gap-2'>
                  {searchQuery && (
                    <Badge variant='secondary' className='gap-1'>
                      Pencarian: "{searchQuery}"
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => handleSearch('')}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant='secondary' className='gap-1'>
                      Kategori:{' '}
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => handleCategoryFilter('all')}
                      />
                    </Badge>
                  )}
                  {priceRange !== 'all' && (
                    <Badge variant='secondary' className='gap-1'>
                      Harga:{' '}
                      {PRICE_RANGES.find((p) => p.value === priceRange)?.label}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => handlePriceFilter('all')}
                      />
                    </Badge>
                  )}
                  {sortBy !== 'newest' && (
                    <Badge variant='secondary' className='gap-1'>
                      Urutan:{' '}
                      {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => handleSort('newest')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {!isLoading && (
          <div className='flex justify-between items-center mb-6'>
            <p className='text-gray-600'>
              {searchQuery ? (
                <>
                  Menampilkan {filteredAndSortedProducts.length} hasil untuk "
                  {searchQuery}"
                </>
              ) : (
                <>Menampilkan {filteredAndSortedProducts.length} produk</>
              )}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <ProductsSkeleton gridLayout={gridLayout} />
        ) : error ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <p className='text-red-500 mb-4'>Gagal memuat produk</p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        ) : filteredAndSortedProducts.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <p className='text-gray-500 mb-4'>
                {searchQuery ? (
                  <>Tidak ada produk yang ditemukan untuk "{searchQuery}"</>
                ) : (
                  <>Tidak ada produk yang tersedia</>
                )}
              </p>
              {hasFilters && (
                <Button onClick={clearFilters} variant='outline'>
                  Hapus Semua Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              'grid gap-4 auto-rows-fr mb-8',
              GRID_LAYOUTS.find((l) => l.value === gridLayout)?.cols ||
                GRID_LAYOUTS[1].cols
            )}>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/kategori/${product.category?.slug}/${product.slug}`}
                userId={userId}
                showBrand={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProductsPage
