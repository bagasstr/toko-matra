import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className='flex items-center justify-center gap-1 sm:gap-2 mt-6'>
      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 sm:h-9 sm:w-9'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size='icon'
          className='h-8 w-8 sm:h-9 sm:w-9'
          onClick={() => onPageChange(page)}>
          {page}
        </Button>
      ))}

      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 sm:h-9 sm:w-9'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default ProductPagination
