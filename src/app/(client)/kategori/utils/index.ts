import { Brand, Category } from '../types'

// Utility function to safely get brand name
export function getBrandName(brand: Brand | undefined | null): string {
  if (!brand) return 'No Brand'
  return brand.name || 'No Brand'
}

// Utility function to safely get category slug
export function getCategorySlug(category: any): string {
  if (typeof category === 'object' && category !== null) {
    return category.slug || 'unknown'
  }
  return 'unknown'
}

// Helper functions for category handling
export function getAllCategorySlugs(category: any): string[] {
  if (!category) return []
  let slugs = [category.slug]
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      slugs = slugs.concat(getAllCategorySlugs(child))
    }
  }
  return slugs
}

export function findCategoryBySlug(
  categories: any[],
  slug: string
): Category | null {
  if (!categories || !Array.isArray(categories)) return null

  for (const cat of categories) {
    if (cat.slug === slug) {
      return cat
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryBySlug(cat.children, slug)
      if (found) return found
    }
  }
  return null
}

// Helper function to calculate total product amount based on quantity
export function calculateTotalAmount(
  quantity: number,
  minOrder: number,
  multiOrder: number
): number {
  if (quantity <= 0) return 0
  if (quantity === 1) return minOrder

  return minOrder + multiOrder * (quantity - 1)
}
