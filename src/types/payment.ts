export interface PaymentDetails {
  paymentType?: string
  vaNumber?: string
  bank?: string
  eWalletType?: string
  expiryTime?: string
  transactionStatus?: string
  fraudStatus?: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  paymentMethod: string
  status: string
  midtransToken?: string
  midtransRedirectUrl?: string
  paymentDetails?: PaymentDetails
  createdAt: Date
  updatedAt: Date
}
