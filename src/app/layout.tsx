import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import ThemesProvider from '@/components/ui/ThemesProvider'
import { Toaster } from 'sonner'
import QueryClientProvider from '@/components/QueryClient'
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
      <head>
        {/* Preload critical resources */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='//vercel-storage.com' />
        <link rel='dns-prefetch' href='//supabase.co' />

        {/* Preload critical images */}
        <link
          rel='preload'
          as='image'
          href='/assets/Logo-TokoMatra.png'
          type='image/png'
        />

        {/* Critical CSS hints */}
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=5'
        />
        <meta name='color-scheme' content='light' />

        {/* PWA Meta Tags */}
        <meta name='application-name' content='Matrakosala' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Matrakosala' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta name='msapplication-tap-highlight' content='no' />
      </head>
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <QueryClientProvider>
          <ThemesProvider forcedTheme='light'>
            <main>{children}</main>
            <Toaster position='top-center' offset={100} />
          </ThemesProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>

        {/* Service Worker Registration */}
        <Script id='register-sw' strategy='afterInteractive'>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>

        {/* Web Vitals Tracking */}
        <Script id='web-vitals' strategy='afterInteractive'>
          {`
            function getCLS(onPerfEntry) {
              if (typeof PerformanceObserver !== 'undefined') {
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                      onPerfEntry(entry);
                    }
                  }
                }).observe({entryTypes: ['layout-shift']});
              }
            }

            function getFCP(onPerfEntry) {
              if (typeof PerformanceObserver !== 'undefined') {
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                      onPerfEntry(entry);
                    }
                  }
                }).observe({entryTypes: ['paint']});
              }
            }

            function getLCP(onPerfEntry) {
              if (typeof PerformanceObserver !== 'undefined') {
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  onPerfEntry(lastEntry);
                }).observe({entryTypes: ['largest-contentful-paint']});
              }
            }

            // Track vitals in production
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
              getCLS(console.log);
              getFCP(console.log);
              getLCP(console.log);
            }
          `}
        </Script>
      </body>
    </html>
  )
}
