import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Semua Produk - TokoMatra',
  description:
    'Jelajahi koleksi lengkap produk bahan bangunan berkualitas di TokoMatra. Temukan semen, keramik, cat, besi beton, dan berbagai material konstruksi lainnya dengan harga terbaik.',
  keywords: [
    'produk bahan bangunan',
    'material konstruksi',
    'semen',
    'keramik',
    'cat',
    'besi beton',
    'TokoMatra',
    'toko online',
    'material bangunan',
  ],
  openGraph: {
    title: 'Semua Produk - TokoMatra',
    description:
      'Koleksi lengkap produk bahan bangunan berkualitas dengan harga terbaik',
    type: 'website',
    siteName: 'TokoMatra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Semua Produk - TokoMatra',
    description:
      'Koleksi lengkap produk bahan bangunan berkualitas dengan harga terbaik',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AllProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
        </div>
      }>
      {children}
    </Suspense>
  )
}
