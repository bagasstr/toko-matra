import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter } from 'lucide-react'

interface ProductFilters {
  categories: string[]
  priceRange: [number, number]
}

interface ProductFilterProps {
  onFilter: (filters: ProductFilters) => void
  categories: string[]
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilter,
  categories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(newCategories)
    onFilter({ categories: newCategories, priceRange })
  }

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    onFilter({ categories: selectedCategories, priceRange: newRange })
  }

  const FilterContent = () => (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Categories</h3>
        <div className='grid grid-cols-1 gap-2'>
          {categories.map((category) => (
            <div key={category} className='flex items-center space-x-2'>
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={category} className='text-sm'>
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Price Range</h3>
        <div className='space-y-4'>
          <Slider
            defaultValue={[0, 1000000]}
            max={1000000}
            step={100000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className='w-full'
          />
          <div className='flex justify-between text-sm'>
            <span>Rp {priceRange[0].toLocaleString()}</span>
            <span>Rp {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filter */}
      <div className='hidden md:block'>
        <Card className='p-4'>
          <FilterContent />
        </Card>
      </div>

      {/* Mobile Filter */}
      <div className='md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='outline' className='w-full'>
              <Filter className='mr-2 h-4 w-4' />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-[300px] sm:w-[400px]'>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export default ProductFilter
