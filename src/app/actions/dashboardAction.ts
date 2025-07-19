'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'
import { unstable_cache } from 'next/cache'
import { CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache'
import { cache } from 'react'

// Cached version of dashboard stats query
const getCachedDashboardStats = cache(async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const firstDay = new Date()
  firstDay.setDate(1)
  firstDay.setHours(0, 0, 0, 0)

  // Parallel execution of all queries for better performance
  const [newOrders, totalCustomers, lowStockProducts, bestSellingProduct] =
    await Promise.all([
      // Get new orders in last 7 days
      prisma.order.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          status: 'CONFIRMED',
        },
      }),

      // Get total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),

      // Get low stock products (less than 10)
      prisma.product.count({
        where: {
          stock: { lte: 10 },
          isActive: true,
        },
      }),

      // Get best selling product this month with product name in one query
      prisma.$queryRaw<
        { productId: string; totalSold: bigint; productName: string }[]
      >`
        SELECT 
          oi."productId",
          SUM(oi.quantity) as "totalSold",
          p.name as "productName"
        FROM "order_items" oi
        JOIN "products" p ON oi."productId" = p."id_product"
        WHERE oi."createdAt" >= ${firstDay}
        GROUP BY oi."productId", p.name
        ORDER BY "totalSold" DESC
        LIMIT 1
      `,
    ])

  return {
    newOrders,
    totalCustomers,
    lowStockProducts,
    bestSellingProduct: bestSellingProduct[0]?.productName || 'Tidak ada',
  }
})

// Cached version of best selling products query
const getCachedBestSellingProducts = cache(async () => {
  // Optimized: Single query with JOIN instead of N+1 queries
  type BestProductRaw = {
    productId: string
    totalsold: bigint
    name: string
    price: bigint
    stock: bigint
    unit: string
  }

  const bestProducts: BestProductRaw[] = await prisma.$queryRaw`
      SELECT 
        oi."productId",
        SUM(oi.quantity)::INTEGER as totalsold,
        p.name,
        p.price,
        p.stock,
        p.unit
      FROM "order_items" oi
      JOIN "products" p ON oi."productId" = p."id_product"
      WHERE p."isActive" = true
      GROUP BY oi."productId", p.name, p.price, p.stock, p.unit
      ORDER BY totalsold DESC
      LIMIT 5`

  if (!bestProducts || bestProducts.length === 0) {
    return []
  }

  return bestProducts.map((item) => ({
    name: item.name,
    price: Number(item.price),
    stock: Number(item.stock),
    totalSold: Number(item.totalsold) || 0,
    unit: item.unit || 'pcs',
  }))
})

// Cached version of sales data query
const getCachedSalesData = cache(async () => {
  // Optimized: Single query with GROUP BY instead of 7 separate queries
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  type SalesDataRaw = {
    date: Date
    totalSales: bigint
  }

  // Single optimized query with date aggregation
  const salesDataRaw: SalesDataRaw[] = await prisma.$queryRaw`
      SELECT 
        DATE(o."createdAt") as date,
        COALESCE(SUM(o."totalAmount"), 0)::BIGINT as "totalSales"
      FROM "orders" o
      WHERE o."createdAt" >= ${sevenDaysAgo}
        AND o."createdAt" <= ${today}
        AND EXISTS (
          SELECT 1 FROM "payments" p 
          WHERE p."orderId" = o."id_order" 
          AND p.status = 'SUCCESS'
        )
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `

  // Create map for quick lookup
  const salesMap = new Map<string, number>()
  salesDataRaw.forEach((item) => {
    const dateKey = item.date.toISOString().split('T')[0]
    salesMap.set(dateKey, Number(item.totalSales))
  })

  // Generate complete 7-day data with 0 for missing days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 6 + i)
    return date
  })

  return last7Days.map((date) => {
    const dateKey = date.toISOString().split('T')[0]
    const sales = salesMap.get(dateKey) || 0

    // Use consistent date formatting to avoid hydration issues
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const dayName = dayNames[date.getDay()]

    return {
      date: dayName,
      fullDate: `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`,
      sales: sales,
    }
  })
})

// Cached version of product sold details query
const getCachedProductSoldDetails = cache(async () => {
  return await prisma.orderItem.count({
    where: {
      order: {
        status: 'DELIVERED',
      },
    },
  })
})

// Combined function to get all dashboard data in one call with single session validation
export async function getAllDashboardData() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    // Execute all cached functions in parallel
    const [dashboardStats, bestSellingProducts, salesData, productSoldDetails] =
      await Promise.all([
        getCachedDashboardStats(),
        getCachedBestSellingProducts(),
        getCachedSalesData(),
        getCachedProductSoldDetails(),
      ])

    return {
      success: true,
      data: {
        dashboardStats,
        bestSellingProducts,
        salesData,
        productSoldDetails,
      },
    }
  } catch (error) {
    console.error('[GET_ALL_DASHBOARD_DATA]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}

export async function getDashboardStats() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    const stats = await getCachedDashboardStats()

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('[GET_DASHBOARD_STATS]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}

export async function getBestSellingProducts() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    const productsWithDetails = await getCachedBestSellingProducts()

    console.log('Final products with details:', productsWithDetails)

    return {
      success: true,
      data: productsWithDetails,
    }
  } catch (error) {
    console.error('[GET_BEST_SELLING_PRODUCTS]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}

export async function getRecentOrders() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    })

    return {
      success: true,
      data: orders,
    }
  } catch (error) {
    console.error('[GET_RECENT_ORDERS]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}

export async function getSalesData() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    const salesData = await getCachedSalesData()

    return {
      success: true,
      data: salesData,
    }
  } catch (error) {
    console.error('[GET_SALES_DATA]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}

export async function getProductSoldDetails() {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    const productSoldDetails = await getCachedProductSoldDetails()

    return {
      success: true,
      data: productSoldDetails,
    }
  } catch (error) {
    console.error('[GET_PRODUCT_SOLD_DETAILS]', error)
    return {
      success: false,
      message: 'Internal error',
      data: null,
    }
  }
}
