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

  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },

  output: 'standalone',
  images: {
    unoptimized: true, // Bypass Next.js optimization karena kita handle sendiri
    domains: ['localhost', 'DESKTOP-02S3AEE'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      {
        protocol: 'http',
        hostname: 'DESKTOP-02S3AEE',
        port: '3000',
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
        hostname: 'toko-matra-k4ms5ei2w-bagasstrs-projects.vercel.app',
        pathname: '/api/images/**',
      },
    ],
  },

  devIndicators: false,

  // Configure for server-side rendering

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
