import Link from 'next/link'
import { getParentCategories } from '@/app/actions/categoryAction'
import { CategoryCard } from './CategoryCard'

/**
 * Section "Kategori" kini adalah **Server Component**.
 * Data di–fetch langsung lewat server action sehingga
 * HTML akhir sudah berisi grid kategori ⇒ LCP turun.
 */
export default async function Category() {
  const { categorie = [], success } = await getParentCategories()

  // Filter valid & active parent categories and limit to 16
  const displayCategories = (success ? categorie : [])
    .filter((cat) => cat && cat.slug && cat.id && cat.isActive !== false)
    .slice(0, 16)

  // Early return if nothing to show
  if (!displayCategories.length) return null

  return (
    <section className='mb-8'>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Kategori Produk
          </h2>
          <Link
            href='/kategori'
            className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'>
            Lihat Semua
          </Link>
        </div>

        {/* Grid kategori */}
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'>
          {displayCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
