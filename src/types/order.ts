export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface IOrder {
  id: string
  userId: string
  user: {
    id: string
    profile: {
      id: string
      email: string
      createdAt: Date
      updatedAt: Date
      userId: string
      fullName: string
      imageUrl: string
      phoneNumber: string
      userName: string
      gender: string
      dateOfBirth: string
      bio: string
      companyName: string
      taxId: string
    }
  }
  addressId: string
  address: string
  status: OrderStatus
  totalAmount: number
  receiptNumber?: string | null
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  createdAt: Date
  updatedAt: Date
  payment: string[]
  shipment?: string | null
  paymentMethod?: string
  bank?: string
  paymentType?: string
  transactionId?: string
  transactionTime?: string
  transactionStatus?: string
  fraudStatus?: string
  vaNumber?: string
  approvalCode?: string
  rawResponse?: string
  paidAt?: string
}
