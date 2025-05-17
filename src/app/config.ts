export const dynamicRoutes = [
  '/',
  '/daftar',
  '/menu',
  '/notifikasi',
  '/keranjang',
  '/kategori',
  '/kategori/[kategori]',
  '/kategori/[...slug]',
  '/verifikasi',
  '/login',
  '/profile',
  '/wishlist',
  '/checkout',
  '/dashboard',
  '/dashboard/pesanan',
  '/dashboard/produk',
  '/dashboard/produk/detail/[id]',
  '/dashboard/produk/edit/[id]',
  '/dashboard/produk/kategori',
  '/dashboard/produk/merek',
  '/dashboard/produk/tambah-produk',
]

// Force all routes to use dynamic rendering instead of static generation
export const dynamic = 'force-dynamic'

// This ensures that dynamic parameters in routes work correctly
export const dynamicParams = true

// This tells Next.js to revalidate these pages at runtime
export const revalidate = 0
