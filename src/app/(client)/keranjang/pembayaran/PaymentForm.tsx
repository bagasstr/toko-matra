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
  X,
  Printer,
} from 'lucide-react'
import {
  getOrderById,
  processCheckoutAndCreateOrder,
} from '@/app/actions/orderAction'
import { getUserAddresses } from '../../../actions/addressAction'
import { useRouter } from 'next/navigation'
import { generateProformaPDF } from '@/lib/pdfProInvFormatter'
import { getPaymentByOrderId } from '@/app/actions/midtransAction'
import dynamic from 'next/dynamic'

// Dynamic import untuk menghindari SSR error
const ProInvoicePdfButton = dynamic(
  () =>
    import('../../components/DownloadPdfButton').then((mod) => ({
      default: mod.ProInvoicePdfButton,
    })),
  { ssr: false }
)

type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'virtual_account' | 'cod'

interface PaymentInstructions {
  type: string
  bank?: string
  vaNumber?: string
  amount?: number
  expiryTime?: string
}

interface PaymentFormProps {
  initialCartData: any
  customerProfile?: {
    id?: string
    fullName?: string
    email?: string
    phoneNumber?: string
    companyName?: string
    taxId?: string
  }
  cookies?: any
  userId?: string
}

const supportedBanks = ['bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb']

const isBankSupported = (bank: string): boolean => {
  return supportedBanks.includes(bank.toLowerCase())
}

const virtualAccountBanks = ['bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb']

// Define CheckoutFormData type
interface CheckoutFormData {
  addressId: string
  bank: string
  amount: number
  paymentMethod: string
  status: string
  orderId: string
  paymentType?: string
  transactionId?: string
  transactionTime?: Date
  transactionStatus?: string
  fraudStatus?: string
  vaNumber?: string
  approvalCode?: string
  currency?: string
  rawResponse?: any
  paidAt?: Date
}

const PaymentForm = ({
  initialCartData,
  cookies,
  customerProfile,
}: PaymentFormProps) => {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [paymentInstructions, setPaymentInstructions] =
    useState<PaymentInstructions | null>(null)
  const [selectedVABank, setSelectedVABank] = useState<string>('')
  const [order, setOrder] = useState<string>(null)
  const [result, setResult] = useState<any>(null)
  // const [dataMidtrans, setDataMidtrans] = useState<any>(null)

  const cartItems = initialCartData?.data || []

  const subtotal = cartItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.product.price) * item.quantity,
    0
  )

  const total = subtotal + subtotal * 0.11
  const ppn = subtotal * 0.11

  // Customer data
  const customerName = customerProfile?.fullName || ''
  const customerCompany = customerProfile?.companyName || ''
  const customerEmail = customerProfile?.email || ''
  const customerPhone = customerProfile?.phoneNumber || ''
  const customerAddress =
    addresses.find((addr) => addr.id === selectedAddressId)?.address || ''

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressResult = await getUserAddresses()

        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data)
          const primaryAddress = addressResult.data.find(
            (addr: any) => addr.isPrimary
          )
          setSelectedAddressId(
            primaryAddress ? primaryAddress.id : addressResult.data[0]?.id || ''
          )
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

    if (!selectedVABank) {
      setError('Silakan pilih bank virtual account')
      return
    }

    setIsProcessing(true)

    try {
      // Create order first
      const orderResult = await processCheckoutAndCreateOrder({
        addressId: selectedAddressId,
        bank: selectedVABank,
        paymentMethod: 'bank_transfer',
        notes: notes,
      })

      if (!orderResult.success || !orderResult.data) {
        setError(orderResult.message || 'Gagal memproses pembayaran')
        setIsProcessing(false)
        return
      }

      // Get the created order details
      const result = await getOrderById(orderResult.data.id)
      if (!result.success || !result.data) {
        setError('Gagal mendapatkan detail pesanan')
        setIsProcessing(false)
        return
      }
      const resultPayment = await getPaymentByOrderId(result.data.id)
      if (!resultPayment.success || !resultPayment.data) {
        setError('Gagal mendapatkan detail pesanan')
        setIsProcessing(false)
        return
      }

      console.log(resultPayment)

      // Create payment transaction
      const resultMidtrans = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sessionToken=${cookies.sessionToken}`,
        },
        body: JSON.stringify({
          bank: selectedVABank,
          paymentType: 'bank_transfer',
          amount: resultPayment.data.amount,
          orderId: resultPayment.data.orderId,
          customerDetails: {
            first_name: result.data.user.profile.fullName,
            email: result.data.user.profile.email,
            phone: result.data.user.profile.phoneNumber,
            alamat: result.data.address.address,
            billing_address: {
              first_name: result.data.address.recipientName,
              phone: result.data.user.profile.phoneNumber,
              address: result.data.address.address,
              city: result.data.address.city,
              province: result.data.address.province,
              postal_code: result.data.address.postalCode,
              country_code: 'IDN',
            },
            shipping_address: {
              first_name: result.data.address.recipientName,
              phone: result.data.user.profile.phoneNumber,
              address: result.data.address.address,
              city: result.data.address.city,
              province: result.data.address.province,
              postal_code: result.data.address.postalCode,
              country_code: 'IDN',
            },
          },
          itemDetails: result.data.items.map((item) => ({
            id: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            name: item.product.name,
            brand: item.product.brandId,
            category: item.product.categoryId,
            merchant_name: 'Toko Matra',
            url: 'https://tokomatra.com',
          })),
        }),
      })

      if (!resultMidtrans.ok) {
        setError('Gagal memproses pembayaran')
        setIsProcessing(false)
        return
      }

      const dataMidtrans = await resultMidtrans.json()
      if (!dataMidtrans.success) {
        setError(dataMidtrans.message || 'Gagal memproses pembayaran')
        setIsProcessing(false)
        return
      }

      // Redirect to order details page
      router.push(`/orders/${result.data.id}`)
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

  const logoBase64 = process.env.NEXT_PUBLIC_LOGO_BASE64 ?? ''

  // Siapkan data invoice
  const invoiceNumber = 'PI-' + Date.now() // Bisa diganti dengan nomor invoice dari backend
  const invoiceDate = new Date().toLocaleDateString('id-ID')
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  )
  const customerLabelAddress = selectedAddress
    ? `${selectedAddress.labelAddress}`
    : '-'
  // Buat HTML invoice
  const htmlContent = generateProformaPDF(
    cartItems,
    total,
    logoBase64,
    invoiceNumber,
    invoiceDate,
    customerName,
    customerCompany,
    customerLabelAddress,
    customerAddress,
    customerEmail,
    customerPhone
  )

  return (
    <div className='max-w-5xl mx-auto py-10 px-4'>
      <div className='flex items-start flex-col gap-6 mb-6'>
        <Link href='/keranjang' className='flex items-center gap-2'>
          <ArrowLeft className='w-4 h-4' />
          Kembali ke Keranjang
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
            </div>

            {addresses.length === 0 ? (
              <div className='text-center py-4'>
                <p className='text-gray-500 mb-4'>
                  Anda belum memiliki alamat tersimpan
                </p>
                <Link
                  href={{
                    pathname: '/profile',
                    query: {
                      user: customerProfile?.id,
                    },
                  }}>
                  <Button>
                    <MapPin className='w-4 h-4 mr-2' />
                    Tambah Alamat Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                <p className='text-sm text-gray-500'>
                  Pilih alamat pengiriman untuk pesanan Anda
                </p>
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

          {/* Detail Pembayaran */}

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

            <div className=' p-6 mb-6 bg-white'>
              <h3 className='text-lg font-semibold mb-4'>Detail Pembayaran</h3>
              <div className='mb-2'>
                <span className='font-medium'>Metode: </span>
                {paymentInstructions?.type === 'bank_transfer' &&
                  'Transfer Bank'}
                {paymentInstructions?.type === 'e_wallet' && 'E-Wallet'}
                {paymentInstructions?.type === 'virtual_account' &&
                  'Virtual Account'}
                {paymentInstructions?.type === 'cod' && 'Bayar di Tempat (COD)'}
              </div>
              <div className='flex flex-col gap-1 mb-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-medium'>
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>PPN (11%)</span>
                  <span className='font-medium'>
                    Rp {(subtotal * 0.11).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-2 mt-2'>
                  <span className='font-bold'>Total</span>
                  <span className='font-bold text-primary text-lg'>
                    Rp {total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2 mt-4'>
                <ProInvoicePdfButton
                  items={cartItems.map((item: any) => ({
                    product: {
                      name: item.product.name,
                      price: item.product.price,
                      unit: item.product.unit,
                      sku: item.product.sku,
                      description: item.product.description,
                    },
                    quantity: item.quantity,
                  }))}
                  subtotal={subtotal}
                  ppn={ppn}
                  total={total}
                  logoBase64={logoBase64}
                  proInvoiceNumber={`PI-${new Date().getFullYear()}${String(
                    new Date().getMonth() + 1
                  ).padStart(2, '0')}${String(new Date().getDate()).padStart(
                    2,
                    '0'
                  )}-${String(new Date().getHours()).padStart(2, '0')}${String(
                    new Date().getMinutes()
                  ).padStart(2, '0')}`}
                  proInvoiceDate={new Date().toLocaleDateString('id-ID')}
                  customerName={customerName}
                  customerCompany={customerCompany}
                  customerAddress={customerAddress}
                  customerEmail={customerEmail}
                  customerPhone={customerPhone}
                  customerTaxId={customerProfile?.taxId || ''}
                  notes={notes}
                  terms='1. Pembayaran dilakukan dalam waktu 7 hari setelah proforma invoice diterima\n2. Barang akan dikirim setelah pembayaran diterima\n3. Harga berlaku selama 30 hari'
                  disabled={!selectedAddressId}
                />
                <span className='text-xs text-gray-500'>
                  Unduh Proforma Invoice
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
                <div className='mt-4'>
                  <label className='text-sm font-medium'>
                    Pilih Bank Virtual Account
                  </label>
                  <div className='space-y-2 mt-2'>
                    {virtualAccountBanks.map((bank) => (
                      <label key={bank} className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          name='va_bank'
                          value={bank}
                          checked={selectedVABank === bank}
                          onChange={() => setSelectedVABank(bank)}
                          className='w-4 h-4'
                        />
                        <span className='text-sm'>{bank.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
