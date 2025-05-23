import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function generateInvoiceNumber(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export function formatCurrency(value: number | undefined) {
  if (typeof value !== 'number' || isNaN(value)) return 'Rp 0,00'
  return 'Rp ' + value.toLocaleString('id-ID')
}
