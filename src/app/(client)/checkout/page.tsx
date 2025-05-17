'use client'

import React from 'react'
import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <div className='max-w-3xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Checkout</h1>
      {/* Add checkout form and order summary here */}
    </div>
  )
}
