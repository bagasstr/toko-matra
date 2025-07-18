'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Scale,
  Ruler,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { getProductById } from '@/app/actions/productAction'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [])

  async function fetchProduct() {
    try {
      const result = await getProductById(params.id as string)
      if (result.success && result.product) {
        setProduct(result.product)
      } else {
        toast.error('Produk tidak ditemukan')
        router.push('/dashboard/produk')
      }
    } catch (error) {
      toast.error('Gagal mengambil data produk')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStockStatus = (stock: number, isActive: boolean) => {
    if (!isActive) return { label: 'Nonaktif', variant: 'secondary' as const }
    if (stock <= 0) return { label: 'Habis', variant: 'destructive' as const }
    if (stock <= 10)
      return { label: 'Stok Menipis', variant: 'destructive' as const }
    return { label: 'Tersedia', variant: 'default' as const }
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <div className='animate-pulse'>
          {/* Header skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='h-10 w-24 bg-gray-200 rounded' />
            <div className='h-10 w-32 bg-gray-200 rounded' />
          </div>

          {/* Image carousel skeleton */}
          <div className='mb-6'>
            <div className='bg-white rounded-lg border p-6'>
              <div className='h-6 w-32 bg-gray-200 rounded mb-4' />
              <div className='w-full pt-[31.25%] bg-gray-200 rounded-lg relative' />
            </div>
          </div>

          {/* Product info grid skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Basic info card */}
            <div className='bg-white rounded-lg border p-6'>
              <div className='h-6 w-40 bg-gray-200 rounded mb-4' />
              <div className='space-y-3'>
                <div className='h-8 w-3/4 bg-gray-200 rounded' />
                <div className='h-4 w-1/2 bg-gray-200 rounded' />
                <div className='h-4 w-2/3 bg-gray-200 rounded' />
                <div className='h-6 w-1/3 bg-gray-200 rounded' />
              </div>
            </div>

            {/* Price and stock card */}
            <div className='bg-white rounded-lg border p-6'>
              <div className='h-6 w-32 bg-gray-200 rounded mb-4' />
              <div className='space-y-3'>
                <div className='h-8 w-2/3 bg-gray-200 rounded' />
                <div className='h-4 w-1/2 bg-gray-200 rounded' />
                <div className='h-6 w-1/3 bg-gray-200 rounded' />
              </div>
            </div>

            {/* Description card */}
            <div className='bg-white rounded-lg border p-6'>
              <div className='h-6 w-24 bg-gray-200 rounded mb-4' />
              <div className='space-y-2'>
                <div className='h-4 w-full bg-gray-200 rounded' />
                <div className='h-4 w-full bg-gray-200 rounded' />
                <div className='h-4 w-3/4 bg-gray-200 rounded' />
              </div>
            </div>

            {/* Categories card */}
            <div className='bg-white rounded-lg border p-6'>
              <div className='h-6 w-24 bg-gray-200 rounded mb-4' />
              <div className='flex flex-wrap gap-2'>
                <div className='h-6 w-20 bg-gray-200 rounded-full' />
                <div className='h-6 w-16 bg-gray-200 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div>Produk tidak ditemukan</div>
  }

  const stockStatus = getStockStatus(product?.stock || 0, product?.isActive)

  console.log(product)

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/dashboard/produk')}
          className='gap-2'>
          <ArrowLeft className='h-4 w-4' />
          Kembali
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/produk/edit/${product.id}`)}
          className='gap-2'>
          <Edit className='h-4 w-4' />
          Edit Produk
        </Button>
      </div>

      {/* Product Images - Full Width with 16:5 Ratio */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Gambar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel className='w-full'>
            <CarouselContent>
              {product.images.map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <div
                    className='relative w-full pt-[31.25%] cursor-pointer'
                    onClick={() => setSelectedImage(image)}>
                    <Image
                      src={image}
                      alt={`Product image ${index + 1}`}
                      fill
                      className='object-contain rounded-lg'
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-2' />
            <CarouselNext className='right-2' />
          </Carousel>
        </CardContent>
      </Card>

      {/* Product Info - Stacked Layout */}
      <div className='space-y-6'>
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>{product.name}</h3>
              <p className='text-sm text-muted-foreground'>{product.sku}</p>
            </div>
            <Separator />
            <div className='flex flex-wrap gap-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Harga</p>
                <p className='font-semibold'>{formatPrice(product.price)}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Kategori</p>
                <p className='font-medium'>{product.category?.name || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Brand</p>
                <p className='font-medium'>{product.Brand?.nameBrand || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Produk</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap gap-6'>
              <div className='flex items-center gap-2'>
                <Package className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Satuan</p>
                  <p className='font-medium'>{product.unit}</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Scale className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Berat</p>
                  <p className='font-medium'>
                    {product.weight ? `${product.weight} kg` : '-'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Ruler className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Dimensi</p>
                  <p className='font-medium'>{product.dimensions || '-'}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className='text-sm text-muted-foreground mb-2'>Deskripsi</p>
              <p className='text-sm'>{product.description || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Stok</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap gap-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Stok</p>
                <p className='font-semibold'>{`${product.stock || 0} ${
                  product.unit
                }`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}>
        <DialogPortal>
          <DialogOverlay className='bg-black/80' />
          <DialogContent className='max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none'>
            <DialogTitle className='sr-only'>{product.name}</DialogTitle>
            <div className='relative w-full h-full'>
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt='Full size preview'
                  width={1920}
                  height={1080}
                  className='w-full h-full object-contain'
                />
              )}
              <DialogClose className='absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2'>
                <X className='h-6 w-6' />
              </DialogClose>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
