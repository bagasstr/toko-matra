export type Category = {
  id: string
  name: string
  slug: string
  children?: Category[]
  parentId?: string
}

export type Brand = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  brand: Brand | null
  category?: {
    slug: string
    name: string
    parentId?: string
  }
  isActive: boolean
  isFeatured?: boolean
  label?: string | null
  minOrder?: number
  multiOrder?: number
  unit?: string
  description?: string
  dimensions?: string
}
