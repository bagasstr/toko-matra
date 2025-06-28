import { useQuery } from '@tanstack/react-query'
import { getPaymentByOrderId } from '@/app/actions/midtransAction'

export interface OrderData {
  payment: {
    id: string
    status: string
    amount: number
    paymentMethod: string
    bank?: string
    vaNumber?: string
    transactionId?: string
    rawResponse?: any
    order: {
      id: string
      status: string
      totalAmount: number
      createdAt: string
      userId: string
      items: {
        id: string
        quantity: number
        price: number
        product: {
          name: string
          images: string[]
        }
      }[]
      address: {
        recipientName: string
        labelAddress: string
        address: string
        city: string
        postalCode: string
      }
    }
  }
  transaction?: null // Webhook will handle updates
}

export function useOrderData(orderId: string) {
  return useQuery<OrderData, Error>({
    queryKey: ['orderDetails', orderId],
    queryFn: async () => {
      try {
        // Validate orderId before making the request
        if (!orderId) {
          throw new Error('ID pesanan tidak valid')
        }

        const paymentRes = await getPaymentByOrderId(orderId)

        if (!paymentRes.success || !paymentRes.data) {
          throw new Error(
            paymentRes.message || 'Gagal memuat detail pembayaran'
          )
        }

        // Validate payment data structure
        if (!paymentRes.data.order) {
          throw new Error('Data pesanan tidak lengkap')
        }

        return {
          payment: paymentRes.data,
          transaction: null, // Webhook Midtrans akan update status di database
        }
      } catch (error) {
        console.error('Error fetching order data:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat data pesanan'
        )
      }
    },
    // Skip the query if orderId is empty
    enabled: !!orderId,
    // Optimized refetch logic - webhook akan menghandle update otomatis
    refetchInterval: (query) => {
      // Stop refetching if payment is success, failed, or cancelled
      const data = query.state.data
      if (
        data?.payment?.status &&
        ['SUCCESS', 'FAILED', 'CANCELLED'].includes(data.payment.status)
      ) {
        return false
      }
      // Refetch every 10 seconds untuk pending payments (mengandalkan webhook)
      return 10000
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchIntervalInBackground: false,
    // Enable stale while revalidate for better UX
    staleTime: 30000, // 30 seconds
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Add retry with exponential backoff for transient errors
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
