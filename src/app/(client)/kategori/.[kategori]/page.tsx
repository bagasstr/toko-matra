// import { products } from '@/app/(client)/components/FeaturedProducts'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getAllProducts } from '@/app/actions/productAction'
import { getCategoryBySlug } from '@/app/actions/categoryAction'

export default async function KategoriPage({
  params,
}: {
  params: { kategori: string } | Promise<{ kategori: string }>
}) {
  const resolvedParams = await params
  const { kategori } = resolvedParams
  const kategoriStr = Array.isArray(kategori) ? kategori[0] : kategori

  // console.log(kategoriStr)

  // Get category info (for name, etc)
  const { category, error: errorCategory } = await getCategoryBySlug(
    kategoriStr
  )
  console.log(category)
  // Get all products
  const { products, error: errorProducts } = await getAllProducts()

  if (errorCategory) {
    return <div>Error: {errorCategory}</div>
  }
  if (errorProducts) {
    return <div>Error: {errorProducts}</div>
  }

  // Filter products by category slug

  const allSlugs = [
    category?.slug,
    ...(category?.children?.map((child) => child.slug) || []),
  ]
  const filteredProducts = products.filter((p) =>
    allSlugs.includes(p.category?.slug)
  )

  return (
    <div className='container px-4 mx-auto py-10'>
      {/* Tombol Kembali */}
      <Link href='/kategori'>
        <Button type='button' size='icon' className='mb-6' variant='ghost'>
          <ArrowLeft />
        </Button>
      </Link>
      <div className='flex items-center mb-6'>
        <nav
          className='text-sm text-gray-500 flex gap-2 items-center mb-6'
          aria-label='Breadcrumb'>
          <Link href='/' className='hover:underline text-primary'>
            Home
          </Link>
          <span className='mx-1'>/</span>
          <Link href='/kategori' className='hover:underline text-primary'>
            Kategori
          </Link>
          <span className='mx-1'>/</span>
          <span className='text-gray-700 font-medium'>{category?.name}</span>
        </nav>
      </div>
      <h1 className='text-2xl font-bold mb-6'>
        {category?.name || 'Kategori Tidak Diketahui'}
      </h1>
      {filteredProducts.length === 0 ? (
        <div className='text-gray-400 text-center py-10'>
          Tidak ada produk dalam kategori ini.
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
          {filteredProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/kategori/${product.category.slug}/${product.slug}`}
              className='group block border rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden p-3 text-center'>
              <div className='flex justify-center mb-2'>
                <Image
                  src={product.images[0] || '/placeholder.png'}
                  alt={product.name}
                  width={80}
                  height={80}
                  className='object-contain'
                />
              </div>
              <div className='font-semibold text-base mb-1 group-hover:text-primary transition line-clamp-2 min-h-[48px]'>
                {product.name}
              </div>
              <div className='text-primary font-bold text-lg'>
                Rp {product.price.toLocaleString('id-ID')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
