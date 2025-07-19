'use server'

import { prisma } from '@/lib/prisma'
import { validateSession } from './session'

interface ExportFilters {
  dateRange: {
    from: Date | null
    to: Date | null
  }
  status: string[]
  categories: string[]
  exportType: 'orders' | 'products' | 'customers' | 'sales'
  includeDetails: boolean
  format: 'xlsx' | 'csv'
}

export async function getExportData(filters: ExportFilters) {
  try {
    const session = await validateSession()
    if (!session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    console.log('Export filters:', JSON.stringify(filters, null, 2))

    let data: any[] = []

    switch (filters.exportType) {
      case 'orders':
        console.log('Exporting orders data...')
        data = await getOrdersData(filters)
        break
      case 'products':
        console.log('Exporting products data...')
        data = await getProductsData(filters)
        break
      case 'customers':
        console.log('Exporting customers data...')
        data = await getCustomersData(filters)
        break
      case 'sales':
        console.log('Exporting sales data...')
        data = await getSalesData(filters)
        break
      default:
        throw new Error(`Invalid export type: ${filters.exportType}`)
    }

    console.log(`Export completed. Records count: ${data.length}`)

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[GET_EXPORT_DATA]', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Internal error',
      data: null,
    }
  }
}

async function getOrdersData(filters: ExportFilters) {
  const whereClause: any = {}

  // Date range filter
  if (filters.dateRange.from || filters.dateRange.to) {
    whereClause.createdAt = {}
    if (filters.dateRange.from) {
      whereClause.createdAt.gte = filters.dateRange.from
    }
    if (filters.dateRange.to) {
      const endDate = new Date(filters.dateRange.to)
      endDate.setHours(23, 59, 59, 999)
      whereClause.createdAt.lte = endDate
    }
  }

  // Status filter
  if (filters.status.length > 0) {
    whereClause.status = { in: filters.status }
  }

  const orders = (await prisma.order.findMany({
    where: whereClause,
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
      payment: filters.includeDetails,
      address: filters.includeDetails,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })) as any

  // Format data for export
  if (filters.includeDetails) {
    // Detailed export with order items
    const detailedData: any[] = []

    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          detailedData.push({
            'ID Pesanan': order.id,
            'Tanggal Pesanan': order.createdAt.toLocaleDateString('id-ID'),
            'Nama Pelanggan':
              order.user?.profile?.fullName || order.user?.email || 'N/A',
            'Email Pelanggan': order.user?.email || 'N/A',
            'Status Pesanan': order.status,
            'Nama Produk': item.product?.name || 'N/A',
            Quantity: item.quantity,
            'Harga Satuan': Number(item.price),
            Subtotal: Number(item.price) * Number(item.quantity),
            'Total Pesanan': Number(order.totalAmount),
            'Metode Pembayaran': order.payment?.[0]?.paymentMethod || 'N/A',
            'Status Pembayaran': order.payment?.[0]?.status || 'N/A',
            'Alamat Pengiriman': order.address?.address || 'N/A',
          })
        })
      }
    })

    return detailedData
  } else {
    // Summary export
    return orders.map((order) => ({
      'ID Pesanan': order.id,
      Tanggal: order.createdAt.toLocaleDateString('id-ID'),
      Pelanggan: order.user?.profile?.fullName || order.user?.email || 'N/A',
      Email: order.user?.email || 'N/A',
      Status: order.status,
      Total: Number(order.totalAmount),
      'Metode Pembayaran': order.payment?.[0]?.paymentMethod || 'N/A',
      'Status Pembayaran': order.payment?.[0]?.status || 'N/A',
    }))
  }
}

async function getProductsData(filters: ExportFilters) {
  console.log('getProductsData called with filters:', filters)

  const whereClause: any = {
    isActive: true,
  }

  // Category filter
  if (filters.categories.length > 0) {
    whereClause.categoryId = { in: filters.categories }
    console.log('Applied category filter:', filters.categories)
  }

  console.log('Products query where clause:', whereClause)

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: filters.includeDetails,
        orderItem: filters.includeDetails
          ? {
              where: {
                order: {
                  status: 'DELIVERED',
                },
              },
            }
          : false,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`Found ${products.length} products`)

    const mappedData = products.map((product) => {
      const totalSold =
        filters.includeDetails && product.orderItem
          ? product.orderItem.reduce(
              (sum, item) => sum + Number(item.quantity),
              0
            )
          : 0

      return {
        'ID Produk': product.id,
        'Nama Produk': product.name,
        Kategori: product.category?.name || 'N/A',
        Merek: product.brand?.name || 'N/A',
        Harga: Number(product.price),
        Stok: Number(product.stock),
        Unit: product.unit,
        Status: product.isActive ? 'Aktif' : 'Nonaktif',
        ...(filters.includeDetails && {
          'Total Terjual': totalSold,
          Deskripsi: product.description || '',
          'Berat (kg)': Number(product.weight || 0),
          Dibuat: product.createdAt.toLocaleDateString('id-ID'),
        }),
      }
    })

    console.log(`Mapped ${mappedData.length} product records`)
    return mappedData
  } catch (error) {
    console.error('Error in getProductsData:', error)
    throw error
  }
}

async function getCustomersData(filters: ExportFilters) {
  const whereClause: any = {
    role: 'CUSTOMER',
  }

  // Date range filter for registration date
  if (filters.dateRange.from || filters.dateRange.to) {
    whereClause.createdAt = {}
    if (filters.dateRange.from) {
      whereClause.createdAt.gte = filters.dateRange.from
    }
    if (filters.dateRange.to) {
      const endDate = new Date(filters.dateRange.to)
      endDate.setHours(23, 59, 59, 999)
      whereClause.createdAt.lte = endDate
    }
  }

  const customers = await prisma.user.findMany({
    where: whereClause,
    include: {
      profile: true,
      order: filters.includeDetails
        ? {
            include: {
              payment: true,
            },
          }
        : {
            select: {
              id: true,
              totalAmount: true,
              status: true,
            },
          },
      address: filters.includeDetails,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return customers.map((customer) => {
    const orders = customer.order || []
    const completedOrders = orders.filter(
      (order) => order.status === 'DELIVERED'
    )
    const totalSpent = completedOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    )

    return {
      'ID Pelanggan': customer.id,
      'Nama Lengkap': customer.profile?.fullName || 'N/A',
      Email: customer.email,
      Username: customer.profile?.userName || 'N/A',
      'No. Telepon': customer.profile?.phoneNumber || 'N/A',
      'Jenis Kelamin': customer.profile?.gender || 'N/A',
      'Tipe User': customer.typeUser,
      'Status Email': customer.emailVerified
        ? 'Terverifikasi'
        : 'Belum Terverifikasi',
      'Total Pesanan': orders.length,
      'Pesanan Selesai': completedOrders.length,
      'Total Belanja': totalSpent,
      Terdaftar: customer.createdAt.toLocaleDateString('id-ID'),
      ...(filters.includeDetails && {
        'Tanggal Lahir': customer.profile?.dateOfBirth || 'N/A',
        Bio: customer.profile?.bio || '',
        'Nama Perusahaan': customer.profile?.companyName || 'N/A',
        NPWP: customer.profile?.taxId || 'N/A',
        'Jumlah Alamat': customer.address?.length || 0,
      }),
    }
  })
}

async function getSalesData(filters: ExportFilters) {
  const whereClause: any = {
    status: 'DELIVERED',
  }

  // Date range filter
  if (filters.dateRange.from || filters.dateRange.to) {
    whereClause.createdAt = {}
    if (filters.dateRange.from) {
      whereClause.createdAt.gte = filters.dateRange.from
    }
    if (filters.dateRange.to) {
      const endDate = new Date(filters.dateRange.to)
      endDate.setHours(23, 59, 59, 999)
      whereClause.createdAt.lte = endDate
    }
  }

  if (filters.includeDetails) {
    // Detailed sales data by order
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const detailedData: any[] = []

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        detailedData.push({
          Tanggal: order.createdAt.toLocaleDateString('id-ID'),
          'ID Pesanan': order.id,
          Pelanggan:
            order.user?.profile?.fullName || order.user?.email || 'N/A',
          Produk: item.product?.name || 'N/A',
          Kategori: item.product?.category?.name || 'N/A',
          Quantity: Number(item.quantity),
          'Harga Satuan': Number(item.price),
          Subtotal: Number(item.price) * Number(item.quantity),
          'Total Pesanan': Number(order.totalAmount),
          'Metode Pembayaran': order.payment?.[0]?.paymentMethod || 'N/A',
        })
      })
    })

    return detailedData
  } else {
    // Summary sales data by date
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by date
    const salesByDate = new Map<
      string,
      { totalSales: number; orderCount: number }
    >()

    orders.forEach((order) => {
      const dateKey = order.createdAt.toDateString()
      const existing = salesByDate.get(dateKey) || {
        totalSales: 0,
        orderCount: 0,
      }

      salesByDate.set(dateKey, {
        totalSales: existing.totalSales + Number(order.totalAmount),
        orderCount: existing.orderCount + 1,
      })
    })

    return Array.from(salesByDate.entries()).map(([dateKey, data]) => ({
      Tanggal: new Date(dateKey).toLocaleDateString('id-ID'),
      'Total Penjualan': data.totalSales,
      'Jumlah Transaksi': data.orderCount,
      'Rata-rata per Transaksi': Math.round(data.totalSales / data.orderCount),
    }))
  }
}
