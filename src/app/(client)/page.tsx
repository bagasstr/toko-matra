import React, { Suspense } from 'react'
import { cn } from '@/lib/utils'
import Category from './components/Category'
import FeaturedProducts from './components/FeaturedProducts'
import Brand from './components/brand'
import Benefit from './components/benefit'
import Faq from './components/faq'
import MaterialsOffer from './components/materialsOffer'
import FooterMobile from './components/footerMobile'
import { getOrderById } from '../actions/orderAction'
const Home = async () => {
  const products = await getOrderById('ORD-1748022780744-AB40222')
  console.log(products)
  return (
    <div className={cn('px-4')}>
      <Suspense fallback={<div>Loading...</div>}>
        <Category />
        <FeaturedProducts />
      </Suspense>
      <Brand />
      <Benefit />
      <Faq />
      {/* <MaterialsOffer /> */}
      {/* <FooterMobile /> */}
    </div>
  )
}

export default Home
