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
import { processCheckout } from '../../../actions/checkoutAction'
import { getUserAddresses } from '../../../actions/addressAction'
import { useRouter } from 'next/navigation'
import { generateProformaPDF } from '@/lib/pdfProInvFormatter'
import { PdfProInvoiceButton } from '../../components/DownloadPdfButton'
import { createMidtransTransaction } from '@/app/actions/paymentAction'

type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'virtual_account' | 'cod'

interface PaymentFormProps {
  initialCartData: any
  customerProfile?: {
    fullName?: string
    email?: string
    phoneNumber?: string
    companyName?: string
  }
}

const PaymentForm = ({
  initialCartData,
  customerProfile,
}: PaymentFormProps) => {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('bank_transfer')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [paymentInstructions, setPaymentInstructions] = useState<{
    type: string
    bank?: string
    vaNumber?: string
    amount?: number
    expiryTime?: string
  } | null>(null)

  const cartItems = initialCartData?.data || []

  const subtotal = cartItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.product.price) * item.quantity,
    0
  )

  const total = subtotal + subtotal * 0.11

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
      // First create the order
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
        const order = typedResult.data.order
        const selectedAddress = addresses.find(
          (addr) => addr.id === selectedAddressId
        )

        // Create Midtrans transaction
        const midtransResult = await createMidtransTransaction(
          order.id,
          total,
          {
            firstName:
              customerProfile?.fullName || selectedAddress?.recipientName || '',
            email: customerProfile?.email || '',
            phone:
              customerProfile?.phoneNumber ||
              selectedAddress?.phoneNumber ||
              '',
          },
          cartItems.map((item: any) => ({
            id: item.product.id,
            price: Number(item.product.price),
            quantity: item.quantity,
            name: item.product.name,
          })),
          paymentMethod
        )

        if (midtransResult.success && midtransResult.data) {
          // Handle different payment methods
          switch (paymentMethod) {
            case 'bank_transfer':
              // Show bank transfer instructions
              setPaymentInstructions({
                type: 'bank_transfer',
                bank: midtransResult.data.bank,
                vaNumber: midtransResult.data.vaNumber,
                amount: total,
                expiryTime: midtransResult.data.expiryTime,
              })
              // Redirect to order detail page
              router.push(`/orders/${order.id}?success=true`)
              break
            case 'e_wallet':
              // Redirect to e-wallet payment page
              if (midtransResult.data.actions?.[0]?.url) {
                window.location.href = midtransResult.data.actions[0].url
              }
              break
            case 'virtual_account':
              // Show virtual account instructions
              setPaymentInstructions({
                type: 'virtual_account',
                bank: midtransResult.data.bank,
                vaNumber: midtransResult.data.vaNumber,
                amount: total,
                expiryTime: midtransResult.data.expiryTime,
              })
              // Redirect to order detail page
              router.push(`/orders/${order.id}?success=true`)
              break
            case 'cod':
              // Handle COD payment
              setPaymentInstructions({
                type: 'cod',
                amount: total,
              })
              // Redirect to order detail page
              router.push(`/orders/${order.id}?success=true`)
              break
          }
        } else {
          setError('Gagal membuat transaksi pembayaran')
        }
      } else {
        setError(typedResult.message || 'Gagal memproses pembayaran')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      setError('Terjadi kesalahan saat memproses pembayaran')
    } finally {
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
  console.log(cartItems)

  const logoBase64 = process.env.NEXT_PUBLIC_LOGO_BASE64 ?? ''

  // Siapkan data invoice
  const invoiceNumber = 'PI-' + Date.now() // Bisa diganti dengan nomor invoice dari backend
  const invoiceDate = new Date().toLocaleDateString('id-ID')
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  )
  const customerName =
    customerProfile?.fullName || selectedAddress?.recipientName || ''
  const customerCompany = customerProfile?.companyName || ''
  const customerEmail = customerProfile?.email || ''
  const customerPhone = customerProfile?.phoneNumber || ''
  const customerAddress = selectedAddress
    ? `${selectedAddress.address}, ${selectedAddress.village}, ${selectedAddress.district}, ${selectedAddress.city}, ${selectedAddress.province} ${selectedAddress.postalCode}`
    : '-'
  const customerLabelAddress = selectedAddress
    ? `${selectedAddress.labelAddress}`
    : '-'
  console.log(customerProfile)
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

  function setShowPreview(arg0: boolean): void {
    throw new Error('Function not implemented.')
  }

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
                <Link href='/profile/addresses/new'>
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
                {paymentMethod === 'bank_transfer' && 'Transfer Bank'}
                {paymentMethod === 'e_wallet' && 'E-Wallet'}
                {paymentMethod === 'virtual_account' && 'Virtual Account'}
                {paymentMethod === 'cod' && 'Bayar di Tempat (COD)'}
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
                <PdfProInvoiceButton
                  htmlContent={htmlContent}
                  disabled={!selectedAddressId}
                  data={{
                    cartItems: cartItems.map((item) => ({
                      product: {
                        id: item.product.id,
                        price: item.product.price,
                        unit: item.product.unit,
                      },
                      quantity: item.quantity,
                    })),
                    customerData: {
                      name: customerName,
                      companyName: customerCompany,
                      address: customerAddress,
                      phone: customerPhone,
                      email: customerEmail,
                    },
                    notes: '',
                  }}
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

      {/* Payment Instructions */}
      {paymentInstructions && (
        <div className='rounded-lg border shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Instruksi Pembayaran</h2>

          <div className='bg-blue-50 p-4 rounded-md'>
            {paymentInstructions.type === 'bank_transfer' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Silakan transfer ke rekening berikut:
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Bank</span>
                    <span className='font-semibold'>
                      {paymentInstructions.bank?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>No. Rekening</span>
                    <span className='font-semibold'>
                      {paymentInstructions.vaNumber}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Atas Nama</span>
                    <span className='font-semibold'>
                      PT Bahan Bangunan Indonesia
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {paymentInstructions.amount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      paymentInstructions.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {paymentInstructions.type === 'virtual_account' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Silakan transfer ke Virtual Account berikut:
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Bank</span>
                    <span className='font-semibold'>
                      {paymentInstructions.bank?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>No. Virtual Account</span>
                    <span className='font-semibold'>
                      {paymentInstructions.vaNumber}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {paymentInstructions.amount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      paymentInstructions.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {paymentInstructions.type === 'e_wallet' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Pembayaran E-Wallet
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-600'>Metode</span>
                    <span className='font-semibold'>
                      {paymentInstructions.bank?.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Jumlah</span>
                    <span className='font-semibold text-primary'>
                      Rp {paymentInstructions.amount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Batas waktu pembayaran:{' '}
                    {new Date(
                      paymentInstructions.expiryTime || ''
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </>
            )}

            {paymentInstructions.type === 'cod' && (
              <>
                <p className='font-medium text-blue-800 mb-2'>
                  Pembayaran di Tempat (COD)
                </p>
                <div className='bg-white p-4 rounded-md mb-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      Total yang harus dibayar
                    </span>
                    <span className='font-semibold text-primary'>
                      Rp {paymentInstructions.amount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className='bg-yellow-50 p-3 rounded-md'>
                  <p className='text-sm text-yellow-800 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Silakan siapkan pembayaran tunai saat barang diterima
                  </p>
                </div>
              </>
            )}

            <div className='mt-4 text-sm text-gray-600'>
              <p className='mb-2'>Catatan Penting:</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>Pastikan jumlah transfer sesuai dengan total pembayaran</li>
                <li>Simpan bukti pembayaran Anda</li>
                <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                <li>Jika ada kendala, silakan hubungi customer service kami</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentForm
