// Define category types
export interface Category {
  id: string
  name: string
  parentId: string
  children?: Category[]
}

export interface FlatCategory {
  id: string
  name: string
  path: string
}

export interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
}

// Schema for category validation
import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama kategori harus minimal 2 karakter.',
  }),
  parentId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .optional(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

// Utility functions
export const buildCategoryTree = (flatList: Category[]): Category[] => {
  const map = new Map<string, Category>()
  const roots: Category[] = []

  flatList.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  flatList.forEach((item) => {
    if (item.parentId) {
      const parent = map.get(item.parentId)
      if (parent && parent.children) {
        parent.children.push(map.get(item.id) as Category)
      }
    } else {
      roots.push(map.get(item.id) as Category)
    }
  })

  return roots
}

export const flattenCategories = (
  categories: Category[],
  parentPath = ''
): FlatCategory[] => {
  return categories.reduce((acc: FlatCategory[], category) => {
    const path = parentPath ? `${parentPath} > ${category.name}` : category.name

    acc.push({
      id: category.id,
      name: category.name,
      path,
    })

    if (category.children && category.children.length > 0) {
      acc = [...acc, ...flattenCategories(category.children, path)]
    }

    return acc
  }, [])
}

export const findCategoryInTree = (
  categories: Category[],
  id: string
): Category | null => {
  for (const category of categories) {
    if (category.id === id) {
      return category
    }

    if (category.children && category.children.length > 0) {
      const found = findCategoryInTree(category.children, id)
      if (found) {
        return found
      }
    }
  }

  return null
}

export const findCategoryPath = (
  flatCategories: FlatCategory[],
  id: string
) => {
  const category = flatCategories.find((cat) => cat.id === id)
  return category ? category.path : ''
}
