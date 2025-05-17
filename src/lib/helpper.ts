import { Decimal } from '@prisma/client/runtime/library'

// Helper function to convert Decimal to number
export function convertDecimalToNumber(data: any): any {
  if (data === null || data === undefined) return data

  // Handle Decimal type
  if (
    data instanceof Decimal ||
    (typeof data === 'object' && data !== null && 'toNumber' in data)
  ) {
    return String(data)
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertDecimalToNumber)
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: any = {}
    for (const key in data) {
      // Skip prototype properties
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertDecimalToNumber(data[key])
      }
    }
    return result
  }

  return data
}

export function generateProductId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `PRD-${Date.now()}-${randomNum}`
}

export function generateCartId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CRT-${Date.now()}-${randomNum}`
}

export function generateCartItemId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CIT-${Date.now()}-${randomNum}`
}

export function generateOrderId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `ORD-${Date.now()}-${randomNum}`
}

export function generateAddressId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `ADR-${Date.now()}-${randomNum}`
}

export function generateCategoryId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `CAT-${Date.now()}-${randomNum}`
}

export function generateBrandId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `BRD-${Date.now()}-${randomNum}`
}

export function generateUserId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `USR-${Date.now()}-${randomNum}`
}

function generateRandomSegment(length: number = 4): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
}

function padRandomNumber(): string {
  return Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
}

export function generateCustomId(prefix: string): string {
  const timestamp = Date.now() // milliseconds
  const randStr = generateRandomSegment()
  const randNum = padRandomNumber()
  return `${prefix}-${timestamp}-${randStr}${randNum}`
}
