'use client'

import { activeAddress } from '@/app/actions/addressAction'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

const CardAddress = ({ userId, address }: { userId: string; address: any }) => {
  const [isPanding, startTransition] = useTransition()
  const [disabled, setDisabled] = useState<boolean>(true)
  const [sortedAddress, setSortedAddress] = useState<any[]>(() => {
    const sorted = [...address].sort((a, b) =>
      a.isActive ? -1 : b.isActive ? 1 : 0
    )
    return sorted
  })
  const [selectAddress, setSelectAddress] = useState<string>(() => {
    // Set initial value to the active address if exists
    const active = address.find((item: any) => item.isActive)

    return active ? active.id : address[0]?.id || 0
  })

  const handleClick = () => {
    startTransition(async () => {
      try {
        await activeAddress(userId, selectAddress)
        const newSorted = [...address].sort((a, b) =>
          a.id === selectAddress ? -1 : b.id === selectAddress ? 1 : 0
        )
        setSortedAddress(newSorted)
        toast.success('Alamat berhasil diubah')
      } catch {
        toast.error('Gagal mengubah alamat')
      }
    })
  }
  return (
    <>
      {sortedAddress.map((item: any, index: number) => (
        <div
          onClick={() => {
            setSelectAddress(item.id)
            setDisabled(false)
          }}
          key={index}
          className={cn(
            'border-2 rounded-lg p-4',
            selectAddress === item.id ? 'border-chart-2' : 'border-gray-200'
          )}>
          <div className='space-y-2 mb-2'>
            <div className='font-semibold flex items-center justify-between w-full'>
              <div
                className={cn(
                  selectAddress === item.id ? 'flex gap-x-2 items-center' : ''
                )}>
                <span>
                  {selectAddress === item.id ? (
                    <Check size={16} className={cn('text-chart-2')} />
                  ) : (
                    ''
                  )}
                </span>
                <span>{item.labelAddress}</span>
              </div>
              {item.isPrimary ? <Badge variant={'secondary'}>Utama</Badge> : ''}
            </div>
            {item && <span className='font-medium'>{item.recipientName}</span>}
          </div>
          <p className='text-gray-700 mb-1'>{item.address}</p>
          <p className='text-sm text-gray-600'>
            {[item.city, item.province, item.postalCode]
              .filter(Boolean)
              .join(', ')}
          </p>
          <div className={cn('flex justify-end mt-4')}>
            <Button
              onClick={() => redirect(`/akun/edit-alamat/${item.id}`)}
              variant='outline'
              className='bg-white hover:bg-gray-100 mt-2'>
              Ubah Alamat
            </Button>
          </div>
        </div>
      ))}
      <div className={cn('flex justify-end mt-4')}>
        <Button
          variant='outline'
          className='bg-white hover:bg-gray-100 mt-2'
          disabled={disabled}
          onClick={handleClick}>
          {isPanding ? 'Memilih...' : 'Pilih Alamat'}
        </Button>
      </div>
    </>
  )
}
export default CardAddress
