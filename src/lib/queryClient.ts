import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time of 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't retry on 404s
      retryOnMount: true,
      // Refetch on window focus for important data
      refetchOnWindowFocus: false,
      // Background refetch interval
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

// Pre-defined query keys for consistency
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.products.all, 'category', categoryId] as const,
    bySlug: (slug: string) =>
      [...queryKeys.products.all, 'slug', slug] as const,
  },
  // Categories
  categories: {
    all: ['categories'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
    bySlug: (slug: string) =>
      [...queryKeys.categories.all, 'slug', slug] as const,
  },
  // Brands
  brands: {
    all: ['brands'] as const,
    byId: (id: string) => [...queryKeys.brands.all, id] as const,
  },
  // User
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    orders: (userId: string) => ['user', 'orders', userId] as const,
    cart: (userId: string) => ['user', 'cart', userId] as const,
    wishlist: (userId: string) => ['user', 'wishlist', userId] as const,
  },
}
