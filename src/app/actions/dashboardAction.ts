'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'

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
      success: true,
      data: {
        newOrders,
        totalCustomers,
        lowStockProducts,
        bestSellingProduct: bestSellingProduct[0]?.productName || 'Tidak ada',
      },
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

    type BestProductRaw = { productId: string; totalSold: number }
    const bestProducts: BestProductRaw[] = await prisma.$queryRaw`\
      SELECT "productId", SUM(quantity) as totalSold\
      FROM "order_items"\
      GROUP BY "productId"\
      ORDER BY totalSold DESC\
      LIMIT 5\
    `

    const productsWithDetails = (
      await Promise.all(
        bestProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              name: true,
              price: true,
              stock: true,
            },
          })
          if (!product) return null
          return {
            name: product.name,
            price: product.price,
            stock: product.stock,
            totalSold: Number(item.totalSold),
          }
        })
      )
    ).filter(
      (
        p
      ): p is {
        name: string
        price: number
        stock: number
        totalSold: number
      } => !!p
    )

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

    // Get sales data for the last 7 days
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    const salesData = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))

        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            payment: {
              some: {
                status: 'SUCCESS',
              },
            },
          },
          select: {
            totalAmount: true,
          },
        })

        const totalSales = orders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        )

        return {
          date: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          sales: totalSales,
        }
      })
    )

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

    const productSoldDetails = await prisma.orderItem.count({
      where: {
        order: {
          status: 'DELIVERED',
        },
      },
    })

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
