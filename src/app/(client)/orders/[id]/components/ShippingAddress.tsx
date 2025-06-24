import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Address {
  recipientName: string
  labelAddress: string
  address: string
  city: string
  postalCode: string
}

interface ShippingAddressProps {
  address: Address | null
}

export const ShippingAddress = memo(({ address }: ShippingAddressProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alamat Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        {address ? (
          <div className='space-y-2'>
            <div className='font-semibold text-gray-900'>
              {address.recipientName}
            </div>
            <div className='text-gray-700 leading-relaxed'>
              <div>{address.address}</div>
              <div>
                {address.city}, {address.postalCode}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-gray-500'>Alamat tidak tersedia</div>
        )}
      </CardContent>
    </Card>
  )
})

ShippingAddress.displayName = 'ShippingAddress'
