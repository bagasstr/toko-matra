import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ProductSortProps {
  onSort: (sortOption: string) => void
}

const ProductSort: React.FC<ProductSortProps> = ({ onSort }) => {
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
      <Label htmlFor='sort' className='text-sm whitespace-nowrap'>
        Sort by:
      </Label>
      <Select onValueChange={onSort} defaultValue='newest'>
        <SelectTrigger id='sort' className='w-full sm:w-[200px]'>
          <SelectValue placeholder='Select sort option' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='newest'>Newest</SelectItem>
          <SelectItem value='price-asc'>Price: Low to High</SelectItem>
          <SelectItem value='price-desc'>Price: High to Low</SelectItem>
          <SelectItem value='name-asc'>Name: A to Z</SelectItem>
          <SelectItem value='name-desc'>Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default ProductSort
