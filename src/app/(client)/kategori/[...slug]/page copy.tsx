import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Star, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllProducts, getProductBySlug } from '@/app/actions/productAction'

const page = async ({
  params,
}: {
  params: { slug: string[] } | Promise<{ slug: string[] }>
}) => {
  const resolvedParams = await params
  const { slug } = resolvedParams
  console.log(slug)

  const slugs = slug[1]
  const { product, error: errorProduct } = await getProductBySlug(slugs)
  console.log(product)
  if (errorProduct) {
    return <div>Error: {errorProduct}</div>
  }

  if (!product) {
    return (
      <div className='py-20 text-center text-lg'>Produk tidak ditemukan.</div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto py-10 px-4 pb-32 relative'>
      {/* Breadcrumb */}
      <nav
        className='mb-6 text-sm text-gray-500 flex gap-2 items-center'
        aria-label='Breadcrumb'>
        <Link href='/' className='hover:underline text-primary'>
          Home
        </Link>
        <span className='mx-1'>/</span>
        <Link href='/kategori' className='hover:underline text-primary'>
          Kategori
        </Link>
        <span className='mx-1'>/</span>
        <Link
          href={`/kategori/${product.category.parent.slug}`}
          className='hover:underline text-primary'>
          {product.category.parent.name}
        </Link>
        <span className='mx-1'>/</span>
        <Link
          href={`/kategori/${product.category.slug}`}
          className='hover:underline text-primary'>
          {product.category.name}
        </Link>
        <span className='mx-1'>/</span>
        <span className='text-gray-700 font-medium'>{product.name}</span>
      </nav>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Galeri gambar */}
        <div className='flex-1 flex flex-col items-center'>
          <div className='w-full flex items-center justify-center mb-4'>
            <Image
              src={product.images[0]}
              alt={product.name}
              width={320}
              height={320}
              className='object-contain rounded-xl bg-gray-50'
            />
          </div>
          {product.imagesUrl && product.imagesUrl.length > 1 && (
            <div className='flex gap-2 justify-center'>
              {product.imagesUrl.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={product.name + '-' + idx}
                  width={60}
                  height={60}
                  className='object-contain rounded bg-gray-100 border p-1'
                />
              ))}
            </div>
          )}
        </div>
        {/* Info produk */}
        <div className='flex-1 flex flex-col gap-3'>
          <h1 className='text-2xl font-bold mb-1'>{product.name}</h1>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-primary font-bold text-2xl'>
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded font-semibold ml-2 ${
                product.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {product.isActive ? 'Tersedia' : 'Stok Habis'}
            </span>
          </div>
          <div className='flex items-center gap-1 text-sm text-yellow-500'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={
                  i < Math.round(product.review.rating) ? '#facc15' : 'none'
                }
                stroke='#facc15'
              />
            ))}
            <span className='ml-2 text-gray-500'>
              {product.rating} | Terjual 0
            </span>
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <span className='text-sm text-gray-500'>Brand:</span>
            <span className='font-medium text-gray-700'>
              {product.brand || 'No Brand'}
            </span>
          </div>

          <div className='mt-4'>
            <h2 className='text-lg font-bold mb-2'>Detail Produk</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
              <div className='bg-gray-50 rounded p-2'>
                Satuan: <span className='font-medium'>{product.unit}</span>
              </div>
              <div className='bg-gray-50 rounded p-2'>
                Berat: <span className='font-medium'>{product.weight}</span>
              </div>
              <div className='bg-gray-50 rounded p-2'>
                Dimensi:{' '}
                <span className='font-medium'>{product.dimensions}</span>
              </div>
            </div>
          </div>
          <div className='mt-4 text-base text-gray-700 leading-relaxed'>
            <h2 className='text-lg font-bold mb-2 text-foreground'>
              Deskripsi
            </h2>
            {product.description}
          </div>
        </div>
      </div>
      {/* Floating Action Buttons */}
      {product.isActive && (
        <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg px-4 py-4 flex gap-3 justify-center md:justify-end max-w-4xl mx-auto w-full'>
          <Button className='flex-1 md:flex-none md:w-auto' variant='outline'>
            Tambah ke Keranjang
          </Button>
          <Button className='flex-1 md:flex-none md:w-auto' variant='default'>
            Beli Langsung
          </Button>
        </div>
      )}
      {/* Produk Terkait */}
      <div className='mt-12'>
        <h2 className='text-lg font-bold mb-4'>Produk Terkait</h2>
        <div className='flex gap-4 overflow-x-auto scrollbar-hide pb-2'>
          {product.url ? (
            <Link
              key={product.slug}
              href={product.url}
              className='block min-w-[180px] w-44 group border rounded-lg bg-white shadow-sm hover:shadow-md transition overflow-hidden'>
              <div className='relative w-full aspect-square bg-gray-50 flex items-center justify-center'>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className='object-contain p-3'
                />
              </div>
              <div className='p-3'>
                <div className='font-semibold text-sm line-clamp-2 mb-1 text-gray-900'>
                  {product.name}
                </div>
                <div className='text-primary font-bold text-base'>
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
              </div>
            </Link>
          ) : (
            <Link
              key={product.slug}
              href={`/kategori/${product.category?.slug || 'unknown'}/${
                product.slug
              }`}
              className='block min-w-[180px] w-44 group border rounded-lg bg-white shadow-sm hover:shadow-md transition overflow-hidden'>
              <div className='relative w-full aspect-square bg-gray-50 flex items-center justify-center'>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className='object-contain p-3'
                />
              </div>
              <div className='p-3'>
                <div className='font-semibold text-sm line-clamp-2 mb-1 text-gray-900'>
                  {product.name}
                </div>
                <div className='text-primary font-bold text-base'>
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
export default page
