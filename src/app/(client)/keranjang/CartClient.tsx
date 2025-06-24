'use client'

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  updateCartItemQuantity,
  clearCart,
  getCartItems,
} from '@/app/actions/cartAction'
import { useCartStore } from '@/hooks/zustandStore'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { formatPrice } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

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

// Memoized cart item component untuk mengurangi re-render
const CartItem = memo(
  ({
    item,
    onUpdateQuantity,
    onRemove,
    onSelectItem,
    isSelected,
  }: {
    item: any
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemove: (itemId: string) => void
    onSelectItem: (itemId: string) => void
    isSelected: boolean
  }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity)

    // Debounced quantity update
    useEffect(() => {
      const timer = setTimeout(() => {
        if (localQuantity !== item.quantity && localQuantity > 0) {
          onUpdateQuantity(item.id, localQuantity)
        }
      }, 500)

      return () => clearTimeout(timer)
    }, [localQuantity, item.quantity, item.id, onUpdateQuantity])

    const itemTotal = useMemo(
      () => item.product.price * item.quantity,
      [item.product.price, item.quantity]
    )

    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(item.product.price),
      [item.product.price]
    )

    const formattedTotal = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(itemTotal),
      [itemTotal]
    )

    return (
      <div className='flex items-center space-x-4 p-4 border-b'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectItem(item.id)}
          className='w-5 h-5'
        />
        <div className='flex-shrink-0'>
          <Image
            src={item.product.images[0] || '/placeholder.png'}
            alt={item.product.name}
            width={80}
            height={80}
            className='rounded-md object-cover'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-medium text-gray-900 truncate'>
            {item.product.name}
          </h3>
          <p className='text-sm text-gray-500'>{formattedPrice}</p>
          <div className='flex items-center mt-2 space-x-2'>
            <button
              onClick={() =>
                setLocalQuantity(
                  Math.max(
                    item.product.minOrder,
                    localQuantity - item.product.multiOrder
                  )
                )
              }
              className='w-8 h-8 flex items-center justify-center border rounded'
              disabled={localQuantity <= item.product.minOrder}>
              -
            </button>
            <input
              type='number'
              value={localQuantity}
              onChange={(e) => setLocalQuantity(parseInt(e.target.value) || 1)}
              className='w-16 text-center border rounded px-2 py-1'
              min={item.product.minOrder}
            />
            <button
              onClick={() =>
                setLocalQuantity(localQuantity + item.product.multiOrder)
              }
              className='w-8 h-8 flex items-center justify-center border rounded'>
              +
            </button>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-sm font-medium text-gray-900'>{formattedTotal}</p>
          <button
            onClick={() => onRemove(item.id)}
            className='mt-2 text-red-600 hover:text-red-800'>
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }
)

CartItem.displayName = 'CartItem'

// Loading skeleton component
const CartSkeleton = memo(() => (
  <div className='space-y-4'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className='flex items-center space-x-4 p-4 border-b'>
        <Skeleton className='w-5 h-5 rounded' />
        <Skeleton className='w-20 h-20 rounded-md' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
          <div className='flex space-x-2'>
            <Skeleton className='w-8 h-8 rounded' />
            <Skeleton className='w-16 h-8 rounded' />
            <Skeleton className='w-8 h-8 rounded' />
          </div>
        </div>
        <div className='text-right space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='w-4 h-4 rounded' />
        </div>
      </div>
    ))}
  </div>
))

CartSkeleton.displayName = 'CartSkeleton'

const CartClient = memo(
  ({ initialCartData, removeItem, validate }: CartClientProps) => {
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
    const [isUpdating, setIsUpdating] = useState(false)
    const [logoBase64, setLogoBase64] = useState<string>('')

    // Memoized calculations
    const selectedProduct = useMemo(
      () => cart.filter((item: any) => selectedItems.includes(item.id)),
      [cart, selectedItems]
    )

    const calculateSubtotal = useCallback(() => {
      return selectedProduct.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0
      )
    }, [selectedProduct])

    const calculatePPN = useCallback(() => {
      return calculateSubtotal() * 0.11
    }, [calculateSubtotal])

    const calculateTotal = useCallback(() => {
      return calculateSubtotal() + calculatePPN()
    }, [calculateSubtotal, calculatePPN])

    const calculateTotalWeight = useCallback(() => {
      return selectedProduct.reduce(
        (sum: number, item: any) =>
          sum + (Number(item.product.weight) || 0) * item.quantity,
        0
      )
    }, [selectedProduct])

    // Memoized formatted values
    const formattedSubtotal = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(calculateSubtotal()),
      [calculateSubtotal]
    )

    const formattedPPN = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(calculatePPN()),
      [calculatePPN]
    )

    const formattedTotal = useMemo(
      () =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(calculateTotal()),
      [calculateTotal]
    )

    const { data: fetchedCartData, isLoading: loadingCart } = useQuery({
      queryKey: ['cart'],
      queryFn: getCartItems,
      initialData: initialCartData,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    })

    // Load logo on component mount
    useEffect(() => {
      const loadLogo = async () => {
        try {
          const { getCompanyLogoBase64 } = await import('@/lib/utils')
          const logoData = await getCompanyLogoBase64()
          setLogoBase64(logoData)
        } catch (error) {
          console.error('Failed to load logo:', error)
        }
      }
      loadLogo()
      setMounted(true)
    }, [])

    useEffect(() => {
      if (initialCartData?.success) {
        setCartData(initialCartData)
        setLoading(false)
      }
    }, [initialCartData])

    // Get customer information from session
    useEffect(() => {
      if (validate?.user) {
        const customerData = {
          name: validate.user.profile?.fullName || '-',
          email: validate.user.email || '-',
          phone: validate.user.profile?.phoneNumber || '-',
          address: validate.user.address?.[0]
            ? `${validate.user.address[0].address || '-'}, ${
                validate.user.address[0].city || '-'
              }, ${validate.user.address[0].province || '-'}`
            : '-',
          company: validate.user.profile?.companyName || '-',
        }
        setCustomerInfo(customerData)
      }
    }, [validate])

    // Sync database cart with state if state is empty
    useEffect(() => {
      const syncCartWithState = async () => {
        if (cartItems.length === 0 && cart.length > 0) {
          await fetchCart()
        }
      }
      syncCartWithState()
    }, [cartItems.length, cart.length, fetchCart])

    // Optimized handlers with useCallback
    const handleCheckout = useCallback(async () => {
      if (isUpdating) return

      try {
        setIsUpdating(true)
        const session = validate
        if (!session) {
          router.push('/login')
          return
        }

        if (selectedItems.length === 0) {
          alert('Pilih minimal satu item untuk checkout')
          return
        }

        await fetchCart()
        const latestCartData = await getCartItems()
        if (!latestCartData.success) {
          alert('Gagal memuat data keranjang')
          return
        }

        const validSelectedItems = selectedItems.filter((itemId) =>
          latestCartData.data.some((item: any) => item.id === itemId)
        )

        if (validSelectedItems.length === 0) {
          alert('Item yang dipilih tidak valid')
          return
        }

        const selectedItemsParam = validSelectedItems.join(',')
        router.push(`/keranjang/pembayaran?items=${selectedItemsParam}`)
      } catch (error) {
        console.error('Error during checkout:', error)
        alert('Terjadi kesalahan saat checkout')
      } finally {
        setIsUpdating(false)
      }
    }, [isUpdating, selectedItems, router, fetchCart, getCartItems])

    const handleSelectItem = useCallback((itemId: string) => {
      setSelectedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      )
    }, [])

    const handleSelectAll = useCallback(() => {
      if (selectedItems.length === cart.length) {
        setSelectedItems([])
      } else {
        setSelectedItems(cart.map((item: any) => item.id))
      }
    }, [selectedItems.length, cart])

    const handleUpdateQuantity = useCallback(
      async (itemId: string, newQuantity: number) => {
        try {
          if (
            typeof newQuantity !== 'number' ||
            isNaN(newQuantity) ||
            newQuantity < 0
          ) {
            console.error('Invalid quantity parameter:', newQuantity)
            return
          }

          const validQuantity = Math.floor(newQuantity)
          if (validQuantity === 0) {
            await removeItem(itemId)
            return
          }
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          const response = await updateCartItemQuantity(itemId, validQuantity)
          if (response.success) {
            // Update local state optimistically
            setCartData((prev: any) => ({
              ...prev,
              data: prev.data.map((item: any) =>
                item.id === itemId ? { ...item, quantity: validQuantity } : item
              ),
            }))

            // Invalidate and refetch cart data
          }
        } catch (error) {
          console.error('Error updating quantity:', error)
        }
      },
      [removeItem, queryClient]
    )

    const handleRemoveItem = useCallback(
      async (itemId: string) => {
        try {
          const response = await removeItem(itemId)
          if (response.success) {
            // Update local state optimistically
            setCartData((prev: any) => ({
              ...prev,
              data: prev.data.filter((item: any) => item.id !== itemId),
            }))

            // Remove from selected items if it was selected
            setSelectedItems((prev) => prev.filter((id) => id !== itemId))

            // Invalidate and refetch cart data
            queryClient.invalidateQueries({ queryKey: ['cart'] })
          }
        } catch (error) {
          console.error('Error removing item:', error)
        }
      },
      [removeItem, queryClient]
    )

    if (!validate) {
      return (
        <div className='text-gray-400 text-center flex flex-col gap-4 py-10'>
          Silahkan login terlebih dahulu.
          <Link href='/login' className='text-blue-500'>
            <Button>Login</Button>
          </Link>
        </div>
      )
    }

    if (!cartData?.success) {
      return (
        <div className='text-gray-400 text-center py-10'>
          Tidak ada produk di keranjang.
        </div>
      )
    }

    if (loading || !mounted) {
      return <CartSkeleton />
    }

    return (
      <div className='container mx-auto px-4 py-8'>
        {cart.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-500 mb-4'>Keranjang Anda kosong</p>
            <Link href='/'>
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className='grid lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-lg shadow'>
                <div className='p-4 border-b'>
                  <label className='flex items-center'>
                    <Checkbox
                      checked={selectedItems.length === cart.length}
                      onCheckedChange={handleSelectAll}
                      className='w-5 h-5 mr-3'
                    />
                    Pilih Semua ({cart.length} produk)
                  </label>
                </div>
                <div className='divide-y'>
                  {cart.map((item: any) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      onSelectItem={handleSelectItem}
                      isSelected={selectedItems.includes(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow p-6 sticky top-4'>
                <h3 className='text-lg font-semibold mb-4'>
                  Ringkasan Pesanan
                </h3>
                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between'>
                    <span>Subtotal ({selectedItems.length} produk)</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>PPN (11%)</span>
                    <span>{formattedPPN}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Total Berat</span>
                    <span>
                      {calculateTotalWeight().toLocaleString('id-ID', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      kg
                    </span>
                  </div>
                  <div className='border-t pt-2'>
                    <div className='flex justify-between font-semibold text-lg'>
                      <span>Total</span>
                      <span>{formattedTotal}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <Button
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0 || isUpdating}
                    className='w-full'>
                    {isUpdating ? 'Memproses...' : 'Checkout'}
                  </Button>

                  {customerInfo && selectedProduct.length > 0 && (
                    <PdfCartButton
                      items={selectedProduct}
                      subtotal={calculateSubtotal()}
                      ppn={calculatePPN()}
                      total={calculateTotal()}
                      totalWeight={calculateTotalWeight()}
                      logoBase64={logoBase64}
                      customerInfo={customerInfo}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

CartClient.displayName = 'CartClient'

export default CartClient
