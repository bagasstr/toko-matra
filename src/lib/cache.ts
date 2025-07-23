import { unstable_cache } from 'next/cache'

// Cache configuration constants
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard-stats',
  BEST_SELLING_PRODUCTS: 'best-selling-products',
  SALES_DATA: 'sales-data',
  PRODUCT_SOLD_DETAILS: 'product-sold-details',
  SESSION_DATA: 'session-data',
  USER_PROFILE: 'user-profile',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
} as const

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  VERY_LONG: 3600, // 1 hour
} as const

// Utility function to create cached functions with consistent configuration
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cacheKey: string,
  duration: number = CACHE_DURATIONS.MEDIUM
) {
  return unstable_cache(fn, [cacheKey], { revalidate: duration })
}

// Cache tags for easier invalidation
export const CACHE_TAGS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  SESSION: 'session',
} as const

// Helper function to invalidate related caches
export function invalidateCache(tags: string[]) {
  // This would be used with Next.js revalidateTag when available
  // For now, we rely on time-based revalidation
  console.log('Cache invalidation requested for tags:', tags)
}
