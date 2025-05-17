'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/hooks/zustandStore'
import { updateCartItemQuantity } from '@/app/actions/cartAction'

export const dynamic = 'force-dynamic'

const CartPage = () => {
  const router = useRouter()
  const {
    items: cart,
    loading,
    selectedItems,
    selectItem,
    selectAll,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [])

  const handleQty = async (id: string, delta: number) => {
    const item = cart.find((item) => item.id === id)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + delta)
    updateQuantity(id, newQuantity)
    await updateCartItemQuantity(id, newQuantity)
  }

  const selectedCartItems = cart.filter((item) =>
    selectedItems.includes(item.id)
  )
  const total = selectedCartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className='max-w-3xl mx-auto py-10 px-4'>
        <h1 className='text-2xl font-bold mb-6'>Keranjang Belanja</h1>
        <div className='text-gray-400 text-center py-10'>
          Memuat keranjang...
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Keranjang Belanja</h1>
      {cart.length === 0 ? (
        <div className='text-gray-400 text-center py-10'>Keranjang kosong.</div>
      ) : (
        <>
          <div className='flex items-center gap-2 mb-4'>
            <input
              type='checkbox'
              checked={selectedItems.length === cart.length && cart.length > 0}
              onChange={selectAll}
              className='w-4 h-4 accent-primary'
              id='selectAll'
            />
            <label
              htmlFor='selectAll'
              className='text-sm font-medium cursor-pointer'>
              Pilih Semua
            </label>
          </div>
          <div className='space-y-4 mb-8'>
            {cart.map((item) => (
              <div
                key={item.id}
                className='flex gap-4 items-center border-b pb-4'>
                <input
                  type='checkbox'
                  checked={selectedItems.includes(item.id)}
                  onChange={() => selectItem(item.id)}
                  className='w-4 h-4 accent-primary'
                />
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
                      onClick={() => handleQty(item.id, -1)}>
                      -
                    </Button>
                    <span className='px-2 font-semibold'>{item.quantity}</span>
                    <Button
                      size='icon'
                      variant='outline'
                      onClick={() => handleQty(item.id, 1)}>
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
                    onClick={() => removeFromCart(item.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className='border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='font-bold text-xl'>
              Total: Rp {total.toLocaleString('id-ID')}
            </div>
            <Button
              className='px-8 py-2 text-base font-semibold'
              disabled={selectedItems.length === 0}
              onClick={() => router.push('/checkout')}>
              Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
