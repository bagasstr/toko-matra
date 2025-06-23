'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RiWhatsappLine } from '@remixicon/react'
import toRupiah from '@develoka/angka-rupiah-js'
import { addToCart } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'
import { getWishlist, toggleWishlist } from '@/app/actions/wishlist'
import { Category, Product } from '../types'

interface ProductDetailPageProps {
  product: Product | null
  parentCategory: Category
  loading: boolean
  allProducts: Product[]
}

export function ProductDetailPage({
  product: safeProduct,
  parentCategory,
  loading,
  allProducts,
}: ProductDetailPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isReadMore, setIsReadMore] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isWishlistMarked, setIsWishlistMarked] = useState(false)
  const [cartMessage, setCartMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [wishlist, setWishlist] = useState<any[]>([])

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
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        toast.success('Produk ditambahkan ke keranjang')
      } else {
        toast.error(result.error || 'Gagal memproses permintaan')
      }
    },
    onError: (error) => {
      toast.error('Terjadi kesalahan: ' + error.message)
    },
  })

  // Wishlist check moved up to ensure consistent hook order
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!safeProduct) return

      const res = await getWishlist(session?.user?.id)
      console.log('Wishlist:', res)
      setIsWishlistMarked(res.some((item) => item.productId === safeProduct.id))
    }
    fetchWishlist()
  }, [safeProduct?.id, session?.user?.id])

  // Validate product data
  if (loading || !safeProduct) {
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

  // Calculate actual quantity based on minOrder and multiOrder
  const calculateActualQuantity = (inputQuantity: number) => {
    if (inputQuantity <= 0) return 0
    if (inputQuantity === 1) return safeProduct.minOrder
    return safeProduct.minOrder + safeProduct.multiOrder * (inputQuantity - 1)
  }

  const handleBuyNow = () => {
    if (!safeProduct || !session?.user?.id) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    const actualQuantity = calculateActualQuantity(quantity)
    addToCartMutation({
      userId: session.user.id,
      productId: safeProduct.id,
      quantity: actualQuantity,
    })
  }

  const handleAddToWishlist = async () => {
    if (!safeProduct) return

    try {
      const result = await toggleWishlist(safeProduct.id)
      if (result.success) {
        setIsWishlistMarked(!isWishlistMarked)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      setIsWishlistMarked(false)
      toast.error('Terjadi kesalahan saat menambahkan ke wishlist')
    }
  }

  const handleAddToCart = () => {
    if (!safeProduct || !session?.user?.id) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    const actualQuantity = calculateActualQuantity(quantity)
    addToCartMutation({
      userId: session.user.id,
      productId: safeProduct.id,
      quantity: actualQuantity,
    })
  }

  if (safeProduct === null) {
    return (
      <div className='text-center text-gray-400 py-10'>
        Produk tidak ditemukan.
      </div>
    )
  }

  return (
    <div className=''>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left Column - Product Images */}
        <div className='p-4'>
          <div className='space-y-4 lg:sticky lg:top-20'>
            <div className='w-full overflow-hidden'>
              <Image
                src={safeProduct.images[selectedImage] || '/placeholder.png'}
                alt={safeProduct.name}
                width={600}
                height={400}
                priority
                className='object-contain p-4 mx-auto max-w-full max-h-[350px]'
              />
            </div>
            {safeProduct.images.length > 1 && (
              <div className='grid grid-cols-5 gap-2'>
                {safeProduct.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`cursor-pointer ${
                      selectedImage === index ? 'ring-2 ring-primary' : ''
                    }`}>
                    <Image
                      src={image}
                      alt={`${safeProduct.name} - ${index + 1}`}
                      width={120}
                      height={80}
                      className='object-contain p-2'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Product Info */}
        <div className='space-y-6'>
          <div className=''>
            <div className=''>
              <p className='text-sm text-gray-500 mb-2'>
                {safeProduct.brand.name}
              </p>
              <p className='text-2xl font-semibold mb-2'>{safeProduct.name}</p>
              {safeProduct.label && (
                <span
                  className={
                    'inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2 ' +
                    (safeProduct.label === 'ready_stock'
                      ? 'bg-green-100 text-green-700'
                      : safeProduct.label === 'suplier'
                      ? 'bg-yellow-100 text-yellow-700'
                      : safeProduct.label === 'indent'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700')
                  }>
                  {safeProduct.label === 'ready_stock'
                    ? 'Ready Stock'
                    : safeProduct.label === 'suplier'
                    ? 'Suplier'
                    : safeProduct.label === 'indent'
                    ? 'Indent'
                    : safeProduct.label}
                </span>
              )}
              <div className='flex items-center justify-between w-full'>
                <p className='text-primary text-xl font-semibold'>
                  {toRupiah(safeProduct.price, { floatingPoint: 0 })}/
                  {safeProduct.unit}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleAddToWishlist}>
                  {isWishlistMarked ? (
                    <Heart fill='red' color='red' size={20} />
                  ) : (
                    <Heart color='red' size={20} />
                  )}
                </Button>
              </div>
            </div>

            {/* Shipping Information Section - Responsive */}
            <section className='mt-6'>
              <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
                <h4 className='font-semibold text-lg mb-1 text-gray-800 flex items-center gap-2'>
                  Informasi Pengiriman
                </h4>
                <p className='text-gray-600 text-sm mb-4'>
                  Kami menggunakan sistem Supply on Demand untuk pengiriman ke
                  seluruh Indonesia. Produk yang tersedia dapat berupa:
                </p>
                <ul className='text-gray-600 text-sm mb-4 list-disc list-outside m-5'>
                  <li>
                    Ready Stock (gudang kami — hanya menjangkau area Pulau Jawa)
                  </li>
                  <li>Ready Stock dari Supplier (dikirim langsung)</li>
                  <li>Indent / Pre-order (produk belum tersedia)</li>
                </ul>
                <p className='text-gray-600 text-sm mb-4'>
                  Biaya pengiriman dihitung berdasarkan berat, volume, dan jarak
                  pengiriman. Untuk produk berat seperti semen, bata, dan
                  material besar lainnya, kami menyediakan armada khusus untuk
                  area yang dijangkau.
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6'>
                  {/* Estimasi Waktu Pengiriman */}
                  <div>
                    <div className='font-medium mb-2 text-gray-800'>
                      Estimasi Waktu Pengiriman:
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2'>
                        <div>
                          <div className='font-semibold text-gray-800'>
                            Jabodetabek
                          </div>
                          <div className='text-xs text-gray-600'>
                            1-2 hari kerja
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2'>
                        <div>
                          <div className='font-semibold text-gray-800'>
                            Pulau Jawa
                          </div>
                          <div className='text-xs text-gray-600'>
                            2-4 hari kerja
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2'>
                        <div>
                          <div className='font-semibold text-gray-800'>
                            Luar Pulau Jawa
                          </div>
                          <div className='text-xs text-gray-600'>
                            1-4 hari kerja (tergantung jarak lokasi suplier ke
                            alamat tujuan)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Metode & Kebijakan Pengiriman */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4'>
                    <div>
                      <div className='font-medium mb-2 text-gray-800'>
                        Metode Pengiriman:
                      </div>
                      <ul className='space-y-2 text-sm'>
                        <li className='flex items-start gap-2'>
                          <span className='text-green-600 mt-0.5'>✔</span>{' '}
                          Ekspedisi partner (untuk pengiriman jabodetabek dan
                          pulau jawa)
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-green-600 mt-0.5'>✔</span>{' '}
                          Ekspedisi dari suplier (untuk pengiriman ke luar kota)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div className='font-medium mb-2 text-gray-800'>
                        Kebijakan Pengiriman:
                      </div>
                      <ul className='space-y-2 text-sm'>
                        <li className='flex items-start gap-2'>
                          <span className='text-green-600 mt-0.5'>✔</span>{' '}
                          Pengiriman dilakukan pada hari kerja (Senin-Sabtu)
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-green-600 mt-0.5'>✔</span>{' '}
                          Konfirmasi jadwal pengiriman akan diberikan melalui
                          WhatsApp
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-green-600 mt-0.5'>✔</span>{' '}
                          Pastikan alamat dan nomor telepon yang diberikan sudah
                          benar
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className='py-8'>
              <h4 className='text-base font-semibold mb-4'>Detail Produk</h4>
              <p className='text-sm grid grid-cols-2'>
                <span className=''>Satuan</span>
                <span className='text-muted-foreground'>
                  {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Minimal Pembelian</span>
                <span className='text-muted-foreground'>
                  {safeProduct.minOrder} {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kelipatan Pembelian</span>
                <span className='text-muted-foreground'>
                  {safeProduct.multiOrder} {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Dimensi</span>
                <span className='text-muted-foreground'>
                  {safeProduct.dimensions}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Merek</span>
                <span className='text-muted-foreground'>
                  {safeProduct.brand.name}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kategori</span>
                <span className='text-muted-foreground'>
                  {safeProduct.category.name}
                </span>
              </p>
              <Separator />
            </div>
            <div className='space-y-2'>
              <h4 className='text-base font-semibold mb-4'>Deskripsi</h4>
              <p className='text-sm text-muted-foreground line-clamp-3'>
                {safeProduct.description}
              </p>
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
        </div>

        {/* Right Column - Desktop Action Bar */}
        <div className='hidden lg:block p-4'>
          <div className='lg:border lg:p-6 lg:sticky lg:top-20 lg:rounded-lg shadow-sm'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col mb-4'>
                <span className='text-sm font-medium mb-2'>Jumlah:</span>
                <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg'>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8 rounded-full'
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    -
                  </Button>
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
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8 rounded-full'
                    onClick={() => setQuantity(quantity + 1)}>
                    +
                  </Button>
                  <span className='text-sm ml-1'>X {safeProduct.unit}</span>
                </div>
                {/* Responsive purchase info box */}
                <div className='mt-2 bg-blue-50 text-blue-800 text-xs p-3 rounded-md'>
                  <p className='font-medium mb-1'>Informasi pembelian:</p>
                  <p className='mb-2'>
                    Jumlah pembelian mengikuti minimal order dan kelipatan.
                    Berikut contoh perhitungan:
                  </p>
                  <div className=''>
                    <table className='w-full text-xs mb-2 min-w-[220px]'>
                      <thead>
                        <tr className='text-left'>
                          <th className='pr-4 font-semibold'>Jumlah</th>
                          <th className='font-semibold'>
                            Total {safeProduct.unit}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2].map((n) => (
                          <tr key={n}>
                            <td className='pr-4'>{n}</td>
                            <td>
                              {safeProduct.minOrder +
                                safeProduct.multiOrder * (n - 1)}{' '}
                              {safeProduct.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className='text-[11px] text-blue-900'>
                    Setiap penambahan 1 pada jumlah, akan menambah{' '}
                    {safeProduct.multiOrder} {safeProduct.unit} dari minimal
                    pembelian. Misal, jika Anda memilih 6, maka total:{' '}
                    {safeProduct.minOrder + safeProduct.multiOrder * 5}{' '}
                    {safeProduct.unit}.
                  </p>
                </div>
              </div>
              <div className='flex items-center justify-between py-3 border-t border-b'>
                <span className='text-sm font-medium'>Subtotal:</span>
                <span className='text-lg font-semibold text-primary'>
                  {toRupiah(
                    safeProduct.price * calculateActualQuantity(quantity),
                    {
                      floatingPoint: 0,
                    }
                  )}
                </span>
              </div>

              <div className='flex flex-col gap-3 mt-2'>
                <Button
                  variant='outline'
                  className='w-full py-6'
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isBuyingNow}>
                  {isAddingToCart ? (
                    <span className='flex items-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-primary'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Proses
                    </span>
                  ) : (
                    'Keranjang'
                  )}
                </Button>
                <Button
                  className='w-full py-6'
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || isBuyingNow}>
                  {isBuyingNow ? (
                    <span className='flex items-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Proses
                    </span>
                  ) : (
                    'Beli Sekarang'
                  )}
                </Button>
              </div>
              <Link
                href='https://wa.me/6281234567890'
                className='hidden lg:block mt-2'>
                <Button variant='ghost' className='text-sm w-full'>
                  <RiWhatsappLine size={20} className='mr-2' /> Hubungi CS untuk
                  detail produk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Fixed Bottom Bar */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t py-3 px-4 z-50'>
        <div className='max-w-7xl mx-auto'>
          {/* Quantity selector and subtotal */}
          <div className='flex items-start flex-col justify-between mb-3 bg-background p-2 rounded-lg gap-4'>
            {isInfoOpen && (
              <div className='mt-2 bg-blue-50 text-blue-800 text-xs p-3 rounded-md'>
                <div className='flex justify-end'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className='text-sm text-muted-foreground p-0 m-0 w-fit h-fit'>
                    <X />
                  </Button>
                </div>
                <p className='font-medium mb-1'>Informasi pembelian:</p>
                <p className='mb-2'>
                  Jumlah pembelian mengikuti minimal order dan kelipatan.
                  Berikut contoh perhitungan:
                </p>
                <div className=''>
                  <table className='w-full text-xs mb-2 min-w-[220px]'>
                    <thead>
                      <tr className='text-left'>
                        <th className='pr-4 font-semibold'>Jumlah</th>
                        <th className='font-semibold'>
                          Total {safeProduct.unit}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2].map((n) => (
                        <tr key={n}>
                          <td className='pr-4'>{n}</td>
                          <td>
                            {safeProduct.minOrder +
                              safeProduct.multiOrder * (n - 1)}{' '}
                            {safeProduct.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className='text-[11px] text-blue-900'>
                  Setiap penambahan 1 pada jumlah, akan menambah{' '}
                  {safeProduct.multiOrder} {safeProduct.unit} dari minimal
                  pembelian. Misal, jika Anda memilih 6, maka total:{' '}
                  {safeProduct.minOrder + safeProduct.multiOrder * 5}{' '}
                  {safeProduct.unit}.
                </p>
              </div>
            )}
            <Button
              variant='link'
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className='text-sm text-muted-foreground p-0 m-0 w-fit h-fit'>
              Informasi Pembelian
            </Button>
            <div className='flex justify-between w-full items-center gap-2'>
              <span className='text-sm font-medium'>Jumlah:</span>
              <div className='flex items-center gap-x-2'>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-9 w-9 rounded-full'
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </Button>
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
                  className='w-10 text-center border rounded-md mx-1 py-0.5 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  min='1'
                />
                <Button
                  variant='outline'
                  size='icon'
                  className='h-9 w-9 rounded-full'
                  onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
                <span className='text-sm ml-1'>
                  {safeProduct.minOrder +
                    (quantity - 1) * safeProduct.multiOrder}{' '}
                  {safeProduct.unit}
                </span>
              </div>
            </div>
            <div className='text-right flex justify-between w-full'>
              <span className='text-sm'>Subtotal:</span>
              <p className='text-base font-semibold text-primary'>
                {toRupiah(
                  safeProduct.price * calculateActualQuantity(quantity),
                  {
                    floatingPoint: 0,
                  }
                )}
              </p>
            </div>
            {/* Button Keranjang dan Beli Sekarang */}
            <div className='flex justify-between w-full gap-3 mt-2'>
              <Button
                className='w-full py-4 text-base font-semibold'
                variant='outline'
                onClick={handleAddToCart}
                disabled={isAddingToCart || isBuyingNow}>
                {isAddingToCart ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-primary'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Proses
                  </span>
                ) : (
                  'Keranjang'
                )}
              </Button>
              <Button
                className='w-full py-4 text-base font-semibold'
                onClick={handleBuyNow}
                disabled={isAddingToCart || isBuyingNow}>
                {isBuyingNow ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Proses
                  </span>
                ) : (
                  'Beli Sekarang'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to ensure content isn't hidden behind fixed bottom bar */}
      <div className='lg:hidden h-32'></div>

      {/* Modal for full description */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-none max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>Detail Produk</DialogTitle>
          </DialogHeader>
          <div className='overflow-y-auto h-[80vh] w-full scrollbar-hide'>
            <div className='py-8'>
              <h4 className='text-base font-semibold mb-4'>Detail Produk</h4>
              <p className='text-sm grid grid-cols-2'>
                <span className=''>Satuan</span>
                <span className='text-muted-foreground'>
                  {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Minimal Pembelian</span>
                <span className='text-muted-foreground'>
                  {safeProduct.minOrder} {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kelipatan Pembelian</span>
                <span className='text-muted-foreground'>
                  {safeProduct.multiOrder} {safeProduct.unit}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Dimensi</span>
                <span className='text-muted-foreground'>
                  {safeProduct.dimensions}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Merek</span>
                <span className='text-muted-foreground'>
                  {safeProduct.brand.name}
                </span>
              </p>
              <Separator />
              <p className='text-sm mt-2 grid grid-cols-2'>
                <span className=''>Kategori</span>
                <span className='text-muted-foreground'>
                  {safeProduct.category.name}
                </span>
              </p>
              <Separator />
            </div>
            <div className='space-y-2'>
              <h4 className='text-base font-semibold mb-4'>Deskripsi</h4>
              <p className='text-sm text-muted-foreground whitespace-pre-line'>
                {safeProduct.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
