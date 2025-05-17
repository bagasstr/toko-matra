/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: true,
  },
  // Disable static optimization for dynamic routes
  output: 'standalone',
  // Configure which pages should be static or dynamic
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Disable static optimization for all pages
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

module.exports = nextConfig 