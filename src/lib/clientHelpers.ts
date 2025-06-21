// Client-safe helper functions

/**
 * Format currency in Indonesian Rupiah
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Format date in Indonesian locale
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return 'Tanggal tidak valid'
  }

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid'
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Tanggal tidak valid'
  }
}

/**
 * Calculate deadline date (24 hours after creation)
 */
export function calculateDeadlineDate(createdAt: string): string {
  try {
    const date = new Date(createdAt)
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid'
    }

    // Add 24 hours
    const deadline = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    return formatDate(deadline.toISOString())
  } catch (error) {
    console.error('Error calculating deadline date:', error)
    return 'Tanggal tidak valid'
  }
}
