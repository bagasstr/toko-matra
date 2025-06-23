'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LogOut,
  User,
  MapPin,
  ShoppingBag,
  Edit2,
  Plus,
  Trash2,
  Phone,
  User2,
  Calendar,
  Building2,
  Receipt,
  Check,
  Mail,
} from 'lucide-react'
import { logout } from '@/app/actions/session'
import { toast } from 'sonner'
import EditProfileForm from '@/components/ui/EditProfileForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteAddress, activeAddress } from '@/app/actions/addressAction'
import { Badge } from '@/components/ui/badge'
import AddAddressForm from '@/components/ui/AddAddressForm'
import EditAddressForm from '@/components/ui/EditAddressForm'
import { cn } from '@/lib/utils'

export interface UserProfile {
  id: string
  email: string
  emailVerified: Date
  role: string
  profile?: {
    fullName?: string
    userName?: string
    phoneNumber?: string
    gender?: 'male' | 'female' | 'other'
    dateOfBirth?: string
    bio?: string
    companyName?: string
    taxId?: string
    imageUrl?: string
  }
  address?: Address[]
  orderCount?: number
}

interface Address {
  id: string
  labelAddress: string
  recipientName: string
  address: string
  province: string
  regency: string
  district: string
  village: string
  postalCode: string
  isPrimary: boolean
  isActive: boolean
}

interface ProfileClientProps {
  user: UserProfile
}

const ProfileClient = ({ user }: ProfileClientProps) => {
  const router = useRouter()
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isPending, startTransition] = useTransition()
  const [disabled, setDisabled] = useState<boolean>(true)
  const [sortedAddress, setSortedAddress] = useState<Address[]>(() => {
    const sorted = [...(user.address || [])].sort((a, b) =>
      a.isActive ? -1 : b.isActive ? 1 : 0
    )
    return sorted
  })

  const [selectAddress, setSelectAddress] = useState<string>(() => {
    const active = user.address?.find((item) => item.isActive)
    return active ? active.id : user.address?.[0]?.id || ''
  })

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Berhasil logout')
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Gagal logout')
    }
  }

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return

    try {
      const result = await deleteAddress(selectedAddress.id)
      if (!result.success) {
        toast.error(result.error || 'Gagal menghapus alamat')
        return
      }

      toast.success('Alamat berhasil dihapus')
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Delete address error:', error)
      toast.error('Terjadi kesalahan saat menghapus alamat')
    }
  }

  const handleSetActiveAddress = () => {
    // Validasi apakah alamat yang dipilih valid
    if (!selectAddress) {
      toast.error('Silakan pilih alamat terlebih dahulu')
      return
    }

    // Validasi apakah alamat yang dipilih milik pengguna ini
    const addressExists = user.address?.some(
      (addr) => addr.id === selectAddress
    )
    if (!addressExists) {
      toast.error('Alamat tidak valid untuk pengguna ini')
      return
    }

    console.log(user.id, selectAddress)

    startTransition(async () => {
      try {
        const result = await activeAddress(user.id, selectAddress)
        if (!result.success) {
          toast.error(result.error || 'Gagal mengubah alamat aktif')
          return
        }
        const newSorted = [...(user.address || [])].sort((a, b) =>
          a.id === selectAddress ? -1 : b.id === selectAddress ? 1 : 0
        )
        setSortedAddress(newSorted)
        toast.success('Alamat aktif berhasil diubah')
        router.refresh()
      } catch (error) {
        console.error('Set active address error:', error)
        toast.error('Terjadi kesalahan saat mengubah alamat aktif')
      }
    })
  }

  useEffect(() => {
    if (user.role === 'admin') {
      router.push('/dashboard')
    }
  }, [user.role, router])

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8 px-4 max-w-5xl'>
        {/* Header */}
        <div className='mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16 border-2 border-white shadow-md'>
              <AvatarImage src={user.profile?.imageUrl} />
              <AvatarFallback className='bg-blue-600 text-white text-xl'>
                {user.profile?.fullName?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                {user.profile?.fullName || 'Pengguna'}
              </h1>
              <p className='text-sm text-gray-500 flex items-center gap-1'>
                <Mail className='h-3.5 w-3.5' />
                {user.email}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Dialog
              open={isProfileDialogOpen}
              onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='gap-2'>
                  <Edit2 className='h-4 w-4' />
                  Edit Profil
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle className='text-xl font-semibold'>
                    Edit Profil
                  </DialogTitle>
                </DialogHeader>
                <EditProfileForm
                  user={{
                    id: user.id,
                    profile: {
                      fullName: user.profile?.fullName || '',
                      userName: user.profile?.userName || '',
                      phoneNumber: user.profile?.phoneNumber || '',
                      gender: user.profile?.gender || 'other',
                      dateOfBirth: user.profile?.dateOfBirth || '',
                      bio: user.profile?.bio || '',
                      companyName: user.profile?.companyName || '',
                      taxId: user.profile?.taxId || '',
                      imageUrl: user.profile?.imageUrl || '',
                    },
                  }}
                  onSuccess={() => {
                    setIsProfileDialogOpen(false)
                    router.refresh()
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='gap-2 text-red-600 hover:text-red-700 hover:bg-red-50'>
              <LogOut className='h-4 w-4' />
              Keluar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className='grid gap-6 md:grid-cols-3'>
          {/* Profile Info */}
          <div className='md:col-span-1 space-y-6'>
            <Card className='shadow-sm'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                  <User className='h-4 w-4 text-blue-600' />
                  Info Profil
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 pt-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <User2 className='h-4 w-4 text-gray-400' />
                  <span>
                    {user.profile?.userName || 'Username belum diatur'}
                  </span>
                </div>

                {user.profile?.phoneNumber && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Phone className='h-4 w-4 text-gray-400' />
                    <span>{user.profile.phoneNumber}</span>
                  </div>
                )}

                {user.profile?.gender && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <User2 className='h-4 w-4 text-gray-400' />
                    <span>
                      {user.profile.gender === 'male'
                        ? 'Laki-laki'
                        : user.profile.gender === 'female'
                        ? 'Perempuan'
                        : 'Lainnya'}
                    </span>
                  </div>
                )}

                {user.profile?.dateOfBirth && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span>
                      {new Date(user.profile.dateOfBirth).toLocaleDateString(
                        'id-ID'
                      )}
                    </span>
                  </div>
                )}

                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <span>
                    Bergabung sejak{' '}
                    {new Date(user.emailVerified || '').toLocaleDateString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className='shadow-sm'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                  <ShoppingBag className='h-4 w-4 text-blue-600' />
                  Statistik
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-blue-50 rounded-lg p-3 text-center'>
                    <p className='text-2xl font-bold text-blue-700'>
                      {user.address?.length || 0}
                    </p>
                    <p className='text-xs text-blue-600'>Alamat</p>
                  </div>
                  <div className='bg-green-50 rounded-lg p-3 text-center'>
                    <p className='text-2xl font-bold text-green-700'>
                      {user.orderCount ?? 0}
                    </p>
                    <p className='text-xs text-green-600'>Pesanan</p>
                  </div>
                </div>

                {user.orderCount && user.orderCount > 0 && (
                  <Button
                    variant='ghost'
                    className='w-full justify-center mt-4 text-blue-600 hover:bg-blue-50'
                    onClick={() => router.push('/profile/pesanan-saya')}>
                    Lihat Riwayat Pesanan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            {user.profile?.bio && (
              <Card className='shadow-sm'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-blue-600'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                      />
                    </svg>
                    Bio
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-sm text-gray-600 italic'>
                    "{user.profile.bio}"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Business Info */}
            {(user.profile?.companyName || user.profile?.taxId) && (
              <Card className='shadow-sm'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg font-medium flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-blue-600' />
                    Info Bisnis
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 pt-2'>
                  {user.profile.companyName && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Building2 className='h-4 w-4 text-gray-400' />
                      <span>{user.profile.companyName}</span>
                    </div>
                  )}
                  {user.profile.taxId && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Receipt className='h-4 w-4 text-gray-400' />
                      <span>{user.profile.taxId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Address */}
          <div className='md:col-span-2'>
            <Card className='shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-blue-600' />
                  Alamat
                </CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setSelectedAddress(null)
                    setIsAddressDialogOpen(true)
                  }}
                  className='gap-1 text-blue-600 hover:bg-blue-50'>
                  <Plus className='h-3.5 w-3.5' />
                  Tambah
                </Button>
              </CardHeader>
              <CardContent>
                {user.address && user.address.length > 0 ? (
                  <div className='space-y-3'>
                    {sortedAddress.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => {
                          setSelectAddress(address.id)
                          setDisabled(false)
                        }}
                        className={cn(
                          'rounded-lg border p-4 cursor-pointer transition-all',
                          selectAddress === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}>
                        <div className='flex justify-between items-start'>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              {selectAddress === address.id && (
                                <Check size={16} className='text-blue-600' />
                              )}
                              <Badge
                                variant={
                                  address.isPrimary ? 'default' : 'outline'
                                }
                                className={
                                  address.isPrimary
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : ''
                                }>
                                {address.labelAddress}
                              </Badge>

                              {address.isPrimary && (
                                <Badge
                                  variant='outline'
                                  className='border-purple-500 text-purple-600'>
                                  Utama
                                </Badge>
                              )}
                            </div>
                            <p className='font-medium text-gray-800'>
                              {address.recipientName}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {address.address}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {[
                                address.village,
                                address.district,
                                address.regency,
                                address.province,
                                address.postalCode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAddress(address)
                                setIsAddressDialogOpen(true)
                              }}
                              className='h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50'>
                              <Edit2 className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAddress(address)
                                setIsDeleteDialogOpen(true)
                              }}
                              className='h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className='flex justify-end mt-4'>
                      <Button
                        variant='default'
                        size='sm'
                        disabled={disabled}
                        onClick={handleSetActiveAddress}
                        className='bg-blue-600 hover:bg-blue-700'>
                        {isPending ? (
                          <span className='flex items-center gap-2'>
                            <svg
                              className='animate-spin h-4 w-4 text-white'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'>
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                            Memproses...
                          </span>
                        ) : (
                          <span className='flex items-center gap-2'>
                            <Check className='h-4 w-4' />
                            Jadikan Alamat Aktif
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <div className='rounded-full bg-blue-50 p-4 mb-3'>
                      <MapPin className='h-6 w-6 text-blue-500' />
                    </div>
                    <h3 className='text-base font-medium text-gray-800 mb-1'>
                      Belum ada alamat
                    </h3>
                    <p className='text-sm text-gray-500 max-w-md mb-4'>
                      Tambahkan alamat untuk memudahkan pengiriman
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedAddress(null)
                        setIsAddressDialogOpen(true)
                      }}
                      size='sm'
                      className='bg-blue-600 hover:bg-blue-700'>
                      <Plus className='h-4 w-4 mr-1' />
                      Tambah Alamat
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog
        open={isAddressDialogOpen && !selectedAddress}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddressDialogOpen(false)
            setSelectedAddress(null)
          }
        }}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              Tambah Alamat
            </DialogTitle>
          </DialogHeader>
          <AddAddressForm addressId={user.id} />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog
        open={isAddressDialogOpen && selectedAddress !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddressDialogOpen(false)
            setSelectedAddress(null)
          }
        }}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              Edit Alamat
            </DialogTitle>
          </DialogHeader>
          <EditAddressForm
            addressDialog={(v) => setIsAddressDialogOpen(v)}
            addressId={selectedAddress?.id || ''}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Address Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className='bg-white rounded-lg'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-lg font-semibold'>
              Hapus Alamat
            </AlertDialogTitle>
            <AlertDialogDescription className='text-gray-600'>
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-4'>
            <AlertDialogCancel className='border-gray-200 text-gray-700 hover:bg-gray-100'>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className='bg-red-500 text-white hover:bg-red-600'>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProfileClient
