'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateCartItemQuantity, clearCart } from '@/app/actions/cartAction'
import { useCartStore } from '@/hooks/zustandStore'
import { Skeleton } from '@/components/ui/skeleton'
import { validateSession } from '@/app/actions/session'
import AuthSection from '@/components/ui/AuthSection'
import { generateCartPDF } from '@/lib/pdfCartFormatter'
import { PdfCartButton } from '../components/DownloadPdfButton'

interface CartClientProps {
  initialCartData: any
  removeItem: (itemId: string) => Promise<any>
  validate: any
}

const CartClient = ({
  initialCartData,
  removeItem,
  validate,
}: CartClientProps) => {
  const router = useRouter()
  const [cartData, setCartData] = useState(initialCartData)
  const cart = cartData?.data || []
  const {
    getSubtotal,
    items: cartItems,
    fetchCart,
    getCartItems,
  } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const selectedProduct = cart.filter((item: any) =>
    selectedItems.includes(item.id)
  )

  useEffect(() => {
    setMounted(true)
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Sync cart data with state when component mounts
    if (initialCartData?.success) {
      setCartData(initialCartData)
      setLoading(false)
    }
  }, [initialCartData])

  // Sync database cart with state if state is empty
  useEffect(() => {
    const syncCartWithState = async () => {
      if (cartItems.length === 0 && cart.length > 0) {
        await fetchCart()
      }
    }
    syncCartWithState()
  }, [cartItems.length, cart.length, fetchCart])

  const handleCheckout = async () => {
    try {
      const session = await validateSession()
      if (!session) {
        // Handle unauthenticated user
        router.push('/login')
        return
      }

      if (selectedItems.length === 0) {
        // Handle no items selected
        alert('Pilih minimal satu item untuk checkout')
        return
      }

      // Ensure cart data is up to date
      await fetchCart()

      // Get the latest cart data
      const latestCartData = await getCartItems()
      if (!latestCartData.success) {
        alert('Gagal memuat data keranjang')
        return
      }

      // Verify selected items still exist in cart
      const validSelectedItems = selectedItems.filter((itemId) =>
        latestCartData.data.some((item: any) => item.id === itemId)
      )

      if (validSelectedItems.length === 0) {
        alert('Item yang dipilih tidak valid')
        return
      }

      // Navigate to checkout page with selected items
      const selectedItemsParam = validSelectedItems.join(',')
      router.push(`/keranjang/pembayaran?items=${selectedItemsParam}`)
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Terjadi kesalahan saat checkout')
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cart.map((item) => item.id))
    }
  }

  if (!validate) {
    return (
      <div className='text-gray-400 text-center flex flex-col gap-4 py-10'>
        Silahkan login terlebih dahulu.
        <Link href='/login' className='text-blue-500'>
          <Button>Login</Button>
        </Link>
      </div>
    )
  } else if (!cartData?.success) {
    return (
      <div className='text-gray-400 text-center py-10'>
        Tidak ada produk di keranjang.
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
        // Remove from selected items if present
        setSelectedItems((prev) => prev.filter((id) => id !== itemId))
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  // Calculate subtotal from cart data directly
  const calculateSubtotal = () => {
    return cart
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className=''>
        <Skeleton className='h-10 w-48 mb-6' />
        <div className='space-y-6'>
          {[1, 2, 3].map((item) => (
            <div key={item} className='flex gap-4 items-center border-b pb-4'>
              <Skeleton className='w-4 h-4 rounded' />
              <Skeleton className='w-16 h-16 rounded' />
              <div className='flex-1'>
                <Skeleton className='h-5 w-3/4 mb-2' />
                <Skeleton className='h-6 w-1/3 mb-2' />
                <Skeleton className='h-4 w-1/2 mb-2' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-8 w-8 rounded' />
                  <Skeleton className='h-6 w-8 rounded' />
                  <Skeleton className='h-8 w-8 rounded' />
                </div>
              </div>
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          ))}
          <div className='flex justify-between items-center pt-4'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
      </div>
    )
  }

  const logoBase64 = process.env.NEXT_PUBLIC_LOGO_BASE64 ?? ''
  const htmlContent = generateCartPDF(
    selectedProduct,
    calculateSubtotal(),
    logoBase64
  )

  return (
    <div className=''>
      <div className='flex justify-between items-start gap-6'>
        {/* Kiri: Daftar Produk */}
        <div className='bg-white rounded-lg shadow p-4 lg:w-2/3'>
          <table className='w-full border text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='p-2 text-center'>
                  <input
                    type='checkbox'
                    id='selectAll'
                    checked={
                      cart.length > 0 && selectedItems.length === cart.length
                    }
                    onChange={handleSelectAll}
                    className='w-4 h-4 accent-primary'
                  />
                </th>
                <th className='p-2 text-left w-1/4'>Nama Produk</th>
                <th className='p-2 text-center'>Jumlah</th>
                <th className='p-2 text-right w-[18%]'>Harga Satuan</th>
                <th className='p-2 text-right'>Nominal</th>
                <th className=''></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className='p-2 text-center'>
                    <input
                      type='checkbox'
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className='w-4 h-4 accent-primary'
                    />
                  </td>
                  <td className='p-2'>
                    <div className='font-medium'>{item.product.name}</div>
                  </td>
                  <td className='p-2 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <Button
                        size='icon'
                        variant='outline'
                        disabled={item.quantity === item.product.minOrder}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(item.product.minOrder, item.quantity - 1)
                          )
                        }>
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }>
                        +
                      </Button>
                    </div>
                  </td>
                  <td className='p-2 text-right'>
                    Rp {Number(item.product.price).toLocaleString('id-ID')}
                  </td>
                  <td className='p-2 text-right'>
                    Rp{' '}
                    {Number(item.product.price * item.quantity).toLocaleString(
                      'id-ID'
                    )}
                  </td>
                  <td className='p-2 text-center'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className='h-5 w-5 text-red-500' />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Kanan: Ringkasan Belanja */}
        <div className='bg-white rounded-lg gap-4 shadow p-4 lg:w-2/4'>
          <div className=''>
            <div className='font-semibold mb-2'>
              <div className='flex justify-between items-center'>
                <span>Ringkasan Belanja</span>
                <PdfCartButton
                  htmlContent={htmlContent}
                  disabled={selectedItems.length === 0}
                />
              </div>
            </div>
          </div>
          <div className='text-sm mb-2'>
            <div>
              <div className='space-y-2'>
                {selectedProduct.map((item) => (
                  <div key={item.id}>
                    <p className=''>
                      {item.product.name} ({item.quantity} {item.product.unit})
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className='text-right mt-7'>
              <div>{selectedItems.length} item</div>
              <div>Rp {calculateSubtotal().toLocaleString('id-ID')}</div>
            </div>
          </div>
          <div className='font-bold text-lg flex justify-between border-t pt-2 mt-2'>
            <span>Total Harga</span>
            <span className='text-primary'>
              Rp {calculateSubtotal().toLocaleString('id-ID')}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className='w-full mt-4 bg-primary text-white py-2 rounded font-semibold'>
            Lanjutkan Ke Pembayaran
          </Button>
          <div className='text-center text-sm text-gray-500 mt-4'>
            <p>
              Total harga yang tertera diatas sudah termasuk PPN sebesar 11%
            </p>
          </div>
        </div>
      </div>
      {/* <div className=''>
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              marginTop: 24,
              border: '1px solid #ccc',
              borderRadius: 8,
              overflow: 'auto',
              maxHeight: 600,
            }}>
            <div
              style={{
                background: '#eee',
                padding: 8,
                fontSize: 12,
                fontWeight: 'bold',
              }}>
              Preview PDF HTML (Development Only)
            </div>
            <iframe
              title='PDF Preview'
              srcDoc={htmlContent}
              style={{
                width: '100%',
                height: 600,
                border: 'none',
                background: '#fff',
              }}
            />
          </div>
        )}
      </div> */}
    </div>
  )
}

export default CartClient
