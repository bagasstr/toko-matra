import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Production optimized cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes - shorter for freshness
      gcTime: 30 * 60 * 1000, // 30 minutes - longer for memory efficiency
      // Reduced retry attempts for faster failures
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status >= 400) return false
        return failureCount < 2 // Reduced from 3 to 2
      },
      // Faster retry delay
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
      // Performance optimizations
      retryOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Disable for better performance
      // Disable auto-refresh for performance
      refetchInterval: false,
      // Network mode for better offline experience
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once for network errors only
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 1
      },
      // Network mode for mutations
      networkMode: 'online',
    },
  },
})

// Enhanced query keys with better typing
export const queryKeys = {
  // Products with pagination support
  products: {
    all: (filters?: Record<string, any>) =>
      filters
        ? (['products', 'all', filters] as const)
        : (['products', 'all'] as const),
    lists: () => ['products', 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.products.lists(), { ...filters }] as const,
    featured: (limit?: number) => ['products', 'featured', limit] as const,
    bestSelling: (limit?: number) =>
      ['products', 'best-selling', limit] as const,
    featuredBySales: (limit?: number) =>
      ['products', 'featured-by-sales', limit] as const,
    byCategory: (categoryId: string, page?: number, limit?: number) =>
      ['products', 'category', categoryId, page, limit] as const,
    bySlug: (slug: string) => ['products', 'slug', slug] as const,
    search: (term: string, filters?: Record<string, any>) =>
      ['products', 'search', term, filters] as const,
  },
  // Categories with hierarchy support
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
    bySlug: (slug: string) =>
      [...queryKeys.categories.all, 'slug', slug] as const,
    byParent: (parentId: string) =>
      [...queryKeys.categories.all, 'parent', parentId] as const,
  },
  // Brands
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.brands.all, id] as const,
    active: () => [...queryKeys.brands.all, 'active'] as const,
  },
  // User data with granular keys
  user: {
    all: (userId: string) => ['user', userId] as const,
    profile: (userId: string) =>
      [...queryKeys.user.all(userId), 'profile'] as const,
    orders: (userId: string, page?: number) =>
      [...queryKeys.user.all(userId), 'orders', page] as const,
    order: (userId: string, orderId: string) =>
      [...queryKeys.user.all(userId), 'order', orderId] as const,
    cart: (userId: string) => [...queryKeys.user.all(userId), 'cart'] as const,
    wishlist: (userId: string) =>
      [...queryKeys.user.all(userId), 'wishlist'] as const,
    addresses: (userId: string) =>
      [...queryKeys.user.all(userId), 'addresses'] as const,
  },
  // Dashboard with time-based keys
  dashboard: {
    all: ['dashboard'] as const,
    stats: (date?: string) =>
      [...queryKeys.dashboard.all, 'stats', date] as const,
    sales: (period: string) =>
      [...queryKeys.dashboard.all, 'sales', period] as const,
    bestProducts: (period: string) =>
      [...queryKeys.dashboard.all, 'best-products', period] as const,
    recentOrders: (limit?: number) =>
      [...queryKeys.dashboard.all, 'recent-orders', limit] as const,
  },
  // Notifications
  notifications: {
    all: (userId: string) => ['notifications', userId] as const,
    unread: (userId: string) =>
      [...queryKeys.notifications.all(userId), 'unread'] as const,
  },
}
