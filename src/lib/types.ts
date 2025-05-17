import type { z } from 'zod'
import type { CreateProductSchema } from './zod'

export type FormDataResult<T = any> = {
  success: boolean
  message: string
  data?: T
}

export type Product = z.infer<typeof CreateProductSchema>

export interface CreateFullProductInput {
  id?: string
  name: string
  slug: string
  sku: string
  description?: string
  images: string[]
  price: number
  unit: string
  weight?: number
  dimensions?: string
  isFeatured?: boolean
  isActive?: boolean
  categoryId: string
  brandId?: string
  inventory: {
    stock: number
    location?: string
    batchNumber?: string
  }
  variants?: {
    name: string
    options: { value: string; priceDiff?: number }[]
  }[]
  attributes?: {
    name?: string
    values?: string[]
    unit?: string
  }[]
}
