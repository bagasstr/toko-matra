import { existsSync } from 'fs'
import type { NextConfig } from 'next'
import dotenv from 'dotenv'
import path from 'path'

const __dirname = path.resolve()
const envFile = `.env || 'development'}`
const envPath = path.join(__dirname, envFile)
if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  console.error(`.env`)
}

const nextConfig: NextConfig = {
  /* config options here */

  // Enable removing console logs in production for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // output: 'standalone',
  images: {
    // unoptimized: false, // Enable Next.js optimization untuk performa
    domains: ['localhost', 'toko.matrakosala.com', 'toko-matra.vercel.app'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'toko-matra.vercel.app',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'toko.matrakosala.com',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    // Add image caching for better performance
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  devIndicators: false,

  // Configure for server-side rendering
  experimental: {
    // Enable modern features for better performance
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-chartjs-2',
      'chart.js',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Set runtime to be server-side for routes that use cookies
  reactStrictMode: true,
  // Set dynamic rendering for the app
  // This is important for routes that use cookies
  serverRuntimeConfig: {
    // Runtime config for pages using cookies
    cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
  },
  // Disable static optimization for dynamic routes
  // staticPageGenerationTimeout: 120,
  // Enable dynamic imports
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
              priority: 10,
            },
            // Separate Chart.js into its own chunk
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 30,
            },
            // Separate Radix UI components
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      }

      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    // Suppress Supabase realtime warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ]

    return config
  },

  // Enable gzip compression
  compress: true,

  // Performance headers
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
