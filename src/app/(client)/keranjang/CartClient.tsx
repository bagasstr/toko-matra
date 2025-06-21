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
import { generateCartPDF } from '@/lib/pdfCartFormatter'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'

// Dynamic import untuk menghindari SSR error
const PdfCartButton = dynamic(
  () =>
    import('../components/DownloadPdfButton').then((mod) => ({
      default: mod.PdfCartButton,
    })),
  { ssr: false }
)

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
  const queryClient = useQueryClient()
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
  const [customerInfo, setCustomerInfo] = useState<any>(null)

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

  // Get customer information from session
  useEffect(() => {
    const getCustomerInfo = async () => {
      try {
        const session = await validateSession()
        if (session?.user) {
          const customerData = {
            name: session.user.profile?.fullName || '-',
            email: session.user.email || '-',
            phone: session.user.profile?.phoneNumber || '-',
            address: session.user.address?.[0]
              ? `${session.user.address[0].address || '-'}, ${
                  session.user.address[0].city || '-'
                }, ${session.user.address[0].province || '-'}`
              : '-',
            company: session.user.profile?.companyName || '-',
          }
          setCustomerInfo(customerData)
        }
      } catch (error) {
        console.error('Error getting customer info:', error)
      }
    }
    getCustomerInfo()
  }, [])

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
      // Validate quantity parameter
      if (
        typeof newQuantity !== 'number' ||
        isNaN(newQuantity) ||
        newQuantity < 0
      ) {
        console.error('Invalid quantity parameter:', newQuantity)
        return
      }

      // Ensure newQuantity is an integer
      const validQuantity = Math.floor(newQuantity)
      if (validQuantity !== newQuantity) {
        console.error('Quantity must be an integer:', newQuantity)
        return
      }

      console.log(`Updating quantity for item ${itemId} to ${validQuantity}`)

      const result = await updateCartItemQuantity(itemId, validQuantity)
      if (result.success) {
        setCartData((prev) => ({
          ...prev,
          data: prev.data.map((item) =>
            item.id === itemId ? { ...item, quantity: validQuantity } : item
          ),
        }))
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } else {
        console.error('Failed to update quantity:', result.error)
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
        queryClient.invalidateQueries({ queryKey: ['cart'] })
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

  // Calculate PPN (11%)
  const calculatePPN = () => {
    const subtotal = calculateSubtotal()
    return Math.round(subtotal * 0.11)
  }

  // Calculate total including PPN
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const ppn = calculatePPN()
    return subtotal + ppn
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
    calculatePPN(),
    calculateTotal(),
    logoBase64,
    customerInfo
  )

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Kiri: Daftar Produk - Mobile View */}
        <div className='bg-white rounded-lg shadow p-4 lg:w-2/3 w-full'>
          <div className='block lg:hidden mb-4'>
            {cart.map((item) => (
              <div
                key={item.id}
                className='border-b pb-4 mb-4 flex items-center space-x-4'>
                <input
                  type='checkbox'
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className='w-4 h-4 accent-primary'
                />
                <div className='flex-1'>
                  <div className='font-medium text-sm'>{item.product.name}</div>
                  <div className='text-xs text-gray-500'>
                    Rp {Number(item.product.price).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8'
                    disabled={item.quantity <= (item.product.minOrder || 1)}
                    onClick={() => {
                      const minOrder = item.product.minOrder || 1
                      const multiOrder = item.product.multiOrder || 1
                      const newQuantity = Math.max(
                        minOrder,
                        item.quantity - multiOrder
                      )

                      console.log('Decrement button clicked:', {
                        itemId: item.id,
                        currentQuantity: item.quantity,
                        minOrder: item.product.minOrder,
                        multiOrder: item.product.multiOrder,
                        calculatedMinOrder: minOrder,
                        calculatedMultiOrder: multiOrder,
                        newQuantity: newQuantity,
                      })

                      handleUpdateQuantity(item.id, newQuantity)
                    }}>
                    -
                  </Button>
                  <span className='text-sm'>{item.quantity}</span>
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8'
                    onClick={() => {
                      const multiOrder = item.product.multiOrder || 1
                      const newQuantity = item.quantity + multiOrder
                      handleUpdateQuantity(item.id, newQuantity)
                    }}>
                    +
                  </Button>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className='h-4 w-4 text-red-500' />
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className='w-full border text-sm hidden lg:table'>
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
                        disabled={item.quantity <= (item.product.minOrder || 1)}
                        onClick={() => {
                          const minOrder = item.product.minOrder || 1
                          const multiOrder = item.product.multiOrder || 1
                          const newQuantity = Math.max(
                            minOrder,
                            item.quantity - multiOrder
                          )

                          console.log('Decrement button clicked:', {
                            itemId: item.id,
                            currentQuantity: item.quantity,
                            minOrder: item.product.minOrder,
                            multiOrder: item.product.multiOrder,
                            calculatedMinOrder: minOrder,
                            calculatedMultiOrder: multiOrder,
                            newQuantity: newQuantity,
                          })

                          handleUpdateQuantity(item.id, newQuantity)
                        }}>
                        -
                      </Button>
                      <span>
                        {item.quantity} / {item.product.unit}
                      </span>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => {
                          const multiOrder = item.product.multiOrder || 1
                          const newQuantity = item.quantity + multiOrder
                          handleUpdateQuantity(item.id, newQuantity)
                        }}>
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

        {/* Kanan: Ringkasan Belanja - Responsive */}
        <div className='bg-white rounded-lg gap-4 shadow p-4 lg:w-1/3 w-full'>
          <div className=''>
            <div className='font-semibold mb-2'>
              <div className='flex justify-between items-center'>
                <span>Ringkasan Belanja</span>
                <PdfCartButton
                  items={selectedProduct}
                  subtotal={calculateSubtotal()}
                  ppn={calculatePPN()}
                  total={calculateTotal()}
                  logoBase64={logoBase64}
                  customerInfo={customerInfo}
                  disabled={selectedItems.length === 0}
                />
              </div>
            </div>
          </div>
          <div className='text-sm mb-2'>
            <div>
              <div className='space-y-2'>
                {selectedProduct.map((item) => (
                  <div key={item.id} className='flex justify-between'>
                    <p className=''>
                      {item.product.name} ({item.quantity} {item.product.unit})
                    </p>
                    <p>
                      Rp{' '}
                      {(item.product.price * item.quantity).toLocaleString(
                        'id-ID'
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className='text-right mt-7 space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
              </div>
              <div className='flex justify-between'>
                <span>PPN (11%)</span>
                <span>Rp {calculatePPN().toLocaleString('id-ID')}</span>
              </div>
              <div className='font-semibold flex justify-between border-t pt-2'>
                <span>Total</span>
                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          <div className='font-bold text-lg flex justify-between border-t pt-2 mt-2'>
            <span>Total Harga</span>
            <span className='text-primary'>
              Rp {calculateTotal().toLocaleString('id-ID')}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className='w-full mt-4 bg-primary text-white py-2 rounded font-semibold'>
            Lanjutkan Ke Pembayaran
          </Button>
          <div className='text-center text-xs text-gray-500 mt-4'>
            <p>Total harga sudah termasuk PPN 11%</p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar for Mobile */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50'>
        <div className='flex justify-between items-center'>
          <div>
            <div className='text-sm text-gray-600'>
              {selectedItems.length} Item
            </div>
            <div className='font-semibold text-primary'>
              Rp {calculateTotal().toLocaleString('id-ID')}
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className='bg-primary text-white px-6 py-2 rounded font-semibold'>
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CartClient
