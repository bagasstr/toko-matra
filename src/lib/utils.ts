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

// Function to convert image to base64 for PDF usage
export const convertImageToBase64 = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Server-side fallback
      const placeholder =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMjAwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMmExZjlkIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5QVC4gTWF0cmEgS29zYWxhPC90ZXh0Pgo8L3N2Zz4K'
      resolve(placeholder)
      return
    }

    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        const placeholder =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMjAwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMmExZjlkIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5QVC4gTWF0cmEgS29zYWxhPC90ZXh0Pgo8L3N2Zz4K'
        resolve(placeholder)
        return
      }
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }
    img.onerror = () => {
      // Fallback: create a simple base64 placeholder
      const placeholder =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMjAwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMmExZjlkIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5QVC4gTWF0cmEgS29zYWxhPC90ZXh0Pgo8L3N2Zz4K'
      resolve(placeholder)
    }
    img.src = imagePath
  })
}

// Function to get company logo as base64
export const getCompanyLogoBase64 = async (): Promise<string> => {
  try {
    return await convertImageToBase64('/assets/Logo-TokoMatra.png')
  } catch (error) {
    console.error('Failed to load company logo:', error)
    // Return fallback SVG logo
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMjAwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMmExZjlkIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5QVC4gTWF0cmEgS29zYWxhIERpZ2RheWE8L3RleHQ+Cjwvc3ZnPgo='
  }
}
