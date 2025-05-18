'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { updateCartItemQuantity, clearCart } from '@/app/actions/cartAction'

interface CartClientProps {
  initialCartData: any
  removeItem: (itemId: string) => Promise<any>
}

const CartClient = ({ initialCartData, removeItem }: CartClientProps) => {
  const [cartData, setCartData] = useState(initialCartData)
  const cart = cartData?.data || []

  if (!cartData?.success) {
    return (
      <div className='max-w-3xl mx-auto py-10 px-4'>
        <h1 className='text-2xl font-bold mb-6'>Keranjang Belanja</h1>
        <div className='text-gray-400 text-center py-10'>
          Terjadi kesalahan saat memuat keranjang.
        </div>
      </div>
    )
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity)
      if (result.success) {
        setCartData((prev) => ({
          ...prev,
          data: prev.data.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          ),
        }))
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await removeItem(itemId)
      if (result.success) {
        setCartData((prev) => ({
          ...prev,
          data: prev.data.filter((item) => item.id !== itemId),
        }))
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  return (
    <div className='max-w-3xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Keranjang Belanja</h1>
      {cart.length === 0 ? (
        <div className='text-gray-400 text-center py-10'>Keranjang kosong.</div>
      ) : (
        <>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                className='w-4 h-4 accent-primary'
                id='selectAll'
              />
              <label
                htmlFor='selectAll'
                className='text-sm font-medium cursor-pointer'>
                Pilih Semua
              </label>
            </div>
          </div>
          <div className='space-y-4 mb-8'>
            {cart.map((item) => (
              <div
                key={item.id}
                className='flex gap-4 items-center border-b pb-4'>
                <input type='checkbox' className='w-4 h-4 accent-primary' />
                <Image
                  src={item.product.images[0] || '/placeholder.png'}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className='object-contain rounded bg-gray-50'
                />
                <div className='flex-1'>
                  <div className='font-semibold text-base mb-1'>
                    {item.product.name}
                  </div>
                  <div className='text-primary font-bold text-lg mb-2'>
                    Rp {Number(item.product.price).toLocaleString('id-ID')}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='icon'
                      variant='outline'
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }>
                      -
                    </Button>
                    <span className='px-2 font-semibold'>{item.quantity}</span>
                    <Button
                      size='icon'
                      variant='outline'
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }>
                      +
                    </Button>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-bold text-base mb-2'>
                    Rp{' '}
                    {(
                      Number(item.product.price) * item.quantity
                    ).toLocaleString('id-ID')}
                  </div>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className='border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='font-bold text-xl'>
              Total: Rp{' '}
              {cart
                .reduce(
                  (sum, item) =>
                    sum + Number(item.product.price) * item.quantity,
                  0
                )
                .toLocaleString('id-ID')}
            </div>
            <Link href='/keranjang/pembayaran'>
              <Button className='px-8 py-2 text-base font-semibold'>
                Checkout
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default CartClient
