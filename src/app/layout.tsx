import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import ThemesProvider from '@/components/ui/ThemesProvider'
import { Toaster } from 'sonner'
import QueryClientProvider from '@/components/QueryClient'
import SessionProvider from '@/components/SessionProvider'
import Script from 'next/script'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'], // Reduced font weights untuk performance
  variable: '--font-poppins',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// Optimize for production performance
export const dynamic = 'auto' // Let Next.js decide based on usage
export const revalidate = 300 // 5 minutes for static pages
export const dynamicParams = true

export const metadata: Metadata = {
  title: 'Toko Matrakosala',
  description:
    'Matrakosala - Toko online terpercaya untuk bahan bangunan dan perlengkapan konstruksi. Temukan produk berkualitas untuk kebutuhan konstruksi Anda dengan harga yang kompetitif dan pelayanan yang dapat diandalkan.',
  keywords: [
    'toko bangunan',
    'material konstruksi',
    'bahan bangunan',
    'alat konstruksi',
    'toko online bangunan',
    'Matrakosala',
  ],
  authors: [{ name: 'PT.Matrakosala Digdaya' }],
  openGraph: {
    title: 'Toko Matrakosala',
    description:
      'Matrakosala - Toko online terpercaya untuk bahan bangunan dan perlengkapan konstruksi.',
    url: 'https://matrakosala.com',
    siteName: 'Matrakosala',
    locale: 'id_ID',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Toko Matrakosala',
    card: 'summary_large_image',
    description:
      'Matrakosala - Toko online terpercaya untuk bahan bangunan dan perlengkapan konstruksi.',
  },
  // Performance optimizations
  other: {
    'theme-color': '#ffffff',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='id' suppressHydrationWarning className='light scrollbar-hide'>
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <QueryClientProvider>
          <SessionProvider>
            <ThemesProvider forcedTheme='light'>
              <main>{children}</main>
              <Toaster position='top-center' offset={100} />
            </ThemesProvider>
          </SessionProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </body>
    </html>
  )
}
