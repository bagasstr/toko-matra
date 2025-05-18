'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building,
  AlertCircle,
  MapPin,
  Check,
} from 'lucide-react'
import { processCheckout } from '../../../actions/checkoutAction'
import { getUserAddresses } from '../../../actions/addressAction'
import { useRouter } from 'next/navigation'

type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'virtual_account' | 'cod'

interface PaymentFormProps {
  initialCartData: any
}

const PaymentForm = ({ initialCartData }: PaymentFormProps) => {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('bank_transfer')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const cartItems = initialCartData?.data || []

  const subtotal = cartItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.product.price) * item.quantity,
    0
  )

  const shippingCost = 25000
  const total = subtotal + shippingCost

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressResult = await getUserAddresses()

        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data)
          // Select primary address by default if available
          const primaryAddress = addressResult.data.find(
            (addr: any) => addr.isPrimary
          )
          if (primaryAddress) {
            setSelectedAddressId(primaryAddress.id)
          } else if (addressResult.data.length > 0) {
            setSelectedAddressId(addressResult.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      }
    }

    fetchAddresses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedAddressId) {
      setError('Silakan pilih alamat pengiriman')
      return
    }

    setIsProcessing(true)

    try {
      const result = await processCheckout({
        addressId: selectedAddressId,
        paymentMethod,
        notes,
      })

      const typedResult = result as {
        success: boolean
        message: string
        data?: any
      }

      if (typedResult.success && typedResult.data?.order?.id) {
        // Redirect to order confirmation page
        router.push(`/orders/${typedResult.data.order.id}?success=true`)
      } else {
        setError(typedResult.message || 'Gagal memproses pembayaran')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      setError('Terjadi kesalahan saat memproses pembayaran')
      setIsProcessing(false)
    }
  }

  if (!initialCartData?.success || cartItems.length === 0) {
    return (
      <div className='max-w-5xl mx-auto py-10 px-4'>
        <div className='flex items-center gap-2 mb-6'>
          <Link href='/keranjang'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Kembali ke Keranjang
            </Button>
          </Link>
        </div>

        <div className='bg-orange-50 text-orange-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>
            Keranjang Anda kosong atau terjadi kesalahan saat memuat data
            keranjang.
          </p>
        </div>

        <Link href='/kategori'>
          <Button>Lihat Produk</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto py-10 px-4'>
      <div className='flex items-center gap-2 mb-6'>
        <Link href='/keranjang'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Kembali ke Keranjang
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Pembayaran</h1>
      </div>

      {error && (
        <div className='bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-2 mb-6'>
          <AlertCircle className='w-5 h-5' />
          <p>{error}</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Order Summary */}
        <div className='md:col-span-2'>
          {/* Shipping Address */}
          <div className='rounded-lg border shadow-sm p-6 mb-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold'>Alamat Pengiriman</h3>
              <p className='text-sm text-gray-500'>
                Pilih alamat pengiriman untuk pesanan Anda
              </p>
            </div>

            {addresses.length === 0 ? (
              <div className='text-center py-4'>
                <p className='text-gray-500 mb-4'>
                  Anda belum memiliki alamat tersimpan
                </p>
                <Link href='/profile/addresses/new'>
                  <Button>
                    <MapPin className='w-4 h-4 mr-2' />
                    Tambah Alamat Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-md p-4 cursor-pointer ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}>
                    <div className='flex justify-between items-start'>
                      <div>
                        <div className='font-medium'>
                          {address.recipientName}
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>
                          {address.labelAddress}
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>
                          {address.address}
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>
                          {address.village}, {address.district}, {address.city},{' '}
                          {address.province} {address.postalCode}
                        </div>
                      </div>
                      {selectedAddressId === address.id && (
                        <div className='text-primary'>
                          <Check className='w-5 h-5' />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Link href='/profile/addresses/new'>
                  <Button variant='outline' className='w-full mt-2'>
                    <MapPin className='w-4 h-4 mr-2' />
                    Tambah Alamat Baru
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className='rounded-lg border shadow-sm p-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold'>Ringkasan Pesanan</h3>
              <p className='text-sm text-gray-500'>
                {cartItems.length} produk dalam pesanan Anda
              </p>
            </div>
            <div className='space-y-4'>
              {cartItems.map((item: any) => (
                <div
                  key={item.id}
                  className='flex gap-4 items-center border-b pb-4'>
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
                    <div className='text-gray-500 text-sm mb-1'>
                      {item.quantity} x Rp{' '}
                      {Number(item.product.price).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className='text-right font-bold'>
                    Rp{' '}
                    {(
                      Number(item.product.price) * item.quantity
                    ).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-6 space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Subtotal</span>
                <span className='font-medium'>
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Biaya Pengiriman</span>
                <span className='font-medium'>
                  Rp {shippingCost.toLocaleString('id-ID')}
                </span>
              </div>
              <div className='flex justify-between border-t pt-2 mt-2'>
                <span className='font-bold'>Total</span>
                <span className='font-bold text-primary text-lg'>
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className='mt-6'>
              <label htmlFor='notes' className='text-sm font-medium'>
                Catatan Pesanan (Opsional)
              </label>
              <textarea
                id='notes'
                placeholder='Tulis catatan untuk pesanan Anda...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className='mt-1 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm'
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className='md:col-span-1'>
          <div className='rounded-lg border shadow-sm p-6 sticky top-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold'>Metode Pembayaran</h3>
              <p className='text-sm text-gray-500'>
                Pilih metode pembayaran yang Anda inginkan
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <label className='flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='bank_transfer'
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className='w-4 h-4 text-blue-600'
                  />
                  <div className='flex gap-2'>
                    <Building className='w-5 h-5 text-blue-600' />
                    <div>
                      <div className='font-medium'>Transfer Bank</div>
                      <div className='text-xs text-gray-500'>
                        BCA, Mandiri, BNI, BRI
                      </div>
                    </div>
                  </div>
                </label>

                <label className='flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='e_wallet'
                    checked={paymentMethod === 'e_wallet'}
                    onChange={() => setPaymentMethod('e_wallet')}
                    className='w-4 h-4 text-green-600'
                  />
                  <div className='flex gap-2'>
                    <Wallet className='w-5 h-5 text-green-600' />
                    <div>
                      <div className='font-medium'>E-Wallet</div>
                      <div className='text-xs text-gray-500'>
                        OVO, GoPay, Dana, ShopeePay
                      </div>
                    </div>
                  </div>
                </label>

                <label className='flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='virtual_account'
                    checked={paymentMethod === 'virtual_account'}
                    onChange={() => setPaymentMethod('virtual_account')}
                    className='w-4 h-4 text-purple-600'
                  />
                  <div className='flex gap-2'>
                    <CreditCard className='w-5 h-5 text-purple-600' />
                    <div>
                      <div className='font-medium'>Virtual Account</div>
                      <div className='text-xs text-gray-500'>
                        BCA VA, Mandiri VA, BNI VA
                      </div>
                    </div>
                  </div>
                </label>

                <label className='flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='cod'
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className='w-4 h-4 text-yellow-600'
                  />
                  <div className='flex gap-2'>
                    <div className='w-5 h-5 flex items-center justify-center text-yellow-600 font-bold'>
                      COD
                    </div>
                    <div>
                      <div className='font-medium'>Bayar di Tempat</div>
                      <div className='text-xs text-gray-500'>
                        Tunai saat barang diterima
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className='mt-6 border-t pt-4'>
                <div className='flex justify-between mb-2'>
                  <span>Total Pembayaran</span>
                  <span className='font-bold text-primary'>
                    Rp {total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <Button
                type='submit'
                className='w-full mt-4'
                disabled={
                  isProcessing || addresses.length === 0 || !selectedAddressId
                }>
                {isProcessing ? 'Memproses Pembayaran...' : 'Proses Pembayaran'}
              </Button>

              <p className='text-xs text-gray-500 mt-4 text-center'>
                Dengan menekan tombol di atas, Anda menyetujui
                <Link href='/terms' className='text-primary mx-1'>
                  syarat dan ketentuan
                </Link>
                kami.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
