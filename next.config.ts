import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Configure for server-side rendering
  output: 'standalone',
  // Set runtime to be server-side for routes that use cookies
  reactStrictMode: true,
  // Set dynamic rendering for the app
  // This is important for routes that use cookies
  serverRuntimeConfig: {
    // Runtime config for pages using cookies
    cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
  },
  // Disable static optimization for dynamic routes
  staticPageGenerationTimeout: 120,
  // Enable dynamic imports
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
