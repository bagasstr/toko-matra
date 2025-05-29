// Format currency in Indonesian Rupiah
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

export function generateProductId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `PRD-${Date.now()}`
}

export function generateCartId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CRT-${Date.now()}`
}

export function generateCartItemId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CIT-${Date.now()}`
}

export function generateOrderId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `ORD-${Date.now()}`
}

export function generateAddressId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `ADR-${Date.now()}`
}

export function generateCategoryId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CAT-${Date.now()}`
}

export function generateBrandId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `BRD-${Date.now()}`
}

export function generateUserId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `USR-${Date.now()}`
}

function generateRandomSegment(length: number = 4): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}

function padRandomNumber(): string {
  return Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
}

export function generateCustomId(prefix: string): string {
  const timestamp = Date.now() // milliseconds
  const randomSegment = generateRandomSegment(6)
  return `${prefix}-${randomSegment}`
}
