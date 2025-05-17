import React from 'react'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const brands = [
  { name: 'Tiga Roda', logo: '/assets/brands/tigaroda.png' },
  { name: 'Holcim', logo: '/assets/brands/holcim.png' },
  { name: 'Roman', logo: '/assets/brands/roman.png' },
  { name: 'Wavin', logo: '/assets/brands/wavin.png' },
  { name: 'Dulux', logo: '/assets/brands/dulux.png' },
  { name: 'Toto', logo: '/assets/brands/toto.png' },
  { name: 'Spandek', logo: '/assets/brands/spandek.png' },
  { name: 'Gunung Garuda', logo: '/assets/brands/gununggaruda.png' },
  { name: 'Sika', logo: '/assets/brands/sika.png' },
]

const Brand = () => {
  return (
    <section className=''>
      <div className='container mx-auto px-4'>
        <div className='my-6 flex items-center justify-between'>
          <h2 className='text-lg sm:text-xl lg:text-2xl text-foreground/85 font-bold'>
            Brand Populer
          </h2>
        </div>

        {/* Mobile Carousel */}
        <div className='lg:hidden overflow-x-auto scrollbar-hide'>
          <div className='flex gap-3 py-2 w-full'>
            {brands.map((brand) => (
              <div key={brand.name} className='group w-[120px] flex-shrink-0'>
                <div className='flex flex-col items-center gap-2'>
                  <Avatar className='w-20 h-20 transition-transform duration-300 group-hover:scale-105'>
                    <AvatarImage src={brand.logo} alt={brand.name} />
                    <AvatarFallback>{brand.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <p className='text-sm text-center font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2'>
                    {brand.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className='hidden lg:grid grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4'>
          {brands.map((brand) => (
            <div key={brand.name} className='group'>
              <div className='flex flex-col items-center gap-2'>
                <Avatar className='w-24 h-24 transition-transform duration-300 group-hover:scale-105'>
                  <AvatarImage src={brand.logo} alt={brand.name} />
                  <AvatarFallback>{brand.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <p className='text-xs md:text-sm text-center font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2'>
                  {brand.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Brand
