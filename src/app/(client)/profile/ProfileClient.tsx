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
  Star,
  Edit2,
  Plus,
  Trash2,
  Phone,
  User2,
  Calendar,
  Building2,
  Receipt,
  Check,
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
  order?: any[]
  review?: any[]
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
  console.log(user)

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
    <div className='min-h-screen bg-gray-50/50'>
      <div className='container mx-auto py-12 space-y-10'>
        <div className='grid gap-8 md:grid-cols-2'>
          {/* Profile Card */}
          <Card className='shadow-lg border-none bg-white rounded-xl overflow-hidden'>
            <CardHeader className='flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50'>
              <CardTitle className='text-2xl font-bold text-gray-800'>
                Informasi Profil
              </CardTitle>
              <Dialog
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-2 hover:bg-white/80 transition-all'>
                    <Edit2 className='h-4 w-4' />
                    Edit
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
            </CardHeader>
            <CardContent className='p-8 space-y-8'>
              <div className='flex items-center gap-8'>
                <Avatar className='h-28 w-28 border-4 border-white shadow-lg'>
                  <AvatarImage src={user.profile?.imageUrl} />
                  <AvatarFallback className='text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white'>
                    {user.profile?.fullName?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-3'>
                  <h3 className='text-3xl font-bold text-gray-800'>
                    {user.profile?.fullName}
                  </h3>
                  <p className='text-sm font-medium text-gray-500'>
                    @{user.profile?.userName}
                  </p>
                  <p className='text-sm text-gray-500'>{user.email}</p>
                </div>
              </div>
              <div className='grid gap-8 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                    <User className='h-4 w-4 text-blue-500' />
                    <span>
                      Bergabung sejak{' '}
                      {new Date(user.emailVerified || '').toLocaleDateString(
                        'id-ID'
                      )}
                    </span>
                  </div>
                  {user.profile?.phoneNumber && (
                    <div className='flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                      <Phone className='h-4 w-4 text-blue-500' />
                      <span>{user.profile.phoneNumber}</span>
                    </div>
                  )}
                  {user.profile?.gender && (
                    <div className='flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                      <User2 className='h-4 w-4 text-blue-500' />
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
                    <div className='flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                      <Calendar className='h-4 w-4 text-blue-500' />
                      <span>
                        {new Date(user.profile.dateOfBirth).toLocaleDateString(
                          'id-ID'
                        )}
                      </span>
                    </div>
                  )}
                </div>
                {user.profile?.bio && (
                  <div className='space-y-3 bg-gray-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-sm text-gray-500'>Bio</h4>
                    <p className='text-sm leading-relaxed text-gray-600'>
                      {user.profile.bio}
                    </p>
                  </div>
                )}
              </div>
              {(user.profile?.companyName || user.profile?.taxId) && (
                <div className='rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
                  <h4 className='mb-4 text-lg font-bold text-gray-800'>
                    Informasi Bisnis
                  </h4>
                  <div className='grid gap-4 md:grid-cols-2'>
                    {user.profile.companyName && (
                      <div className='flex items-center gap-3 text-sm bg-white/50 p-3 rounded-lg'>
                        <Building2 className='h-4 w-4 text-blue-500' />
                        <span className='text-gray-600'>
                          {user.profile.companyName}
                        </span>
                      </div>
                    )}
                    {user.profile.taxId && (
                      <div className='flex items-center gap-3 text-sm bg-white/50 p-3 rounded-lg'>
                        <Receipt className='h-4 w-4 text-blue-500' />
                        <span className='text-gray-600'>
                          {user.profile.taxId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Stats Card */}
          <Card className='shadow-lg border-none bg-white rounded-xl overflow-hidden'>
            <CardHeader className='border-b bg-gradient-to-r from-blue-50 to-indigo-50'>
              <CardTitle className='text-2xl font-bold text-gray-800'>
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className='p-8'>
              <div className='grid grid-cols-2 gap-8'>
                <div className='flex items-center gap-6 bg-gray-50 p-6 rounded-xl'>
                  <div className='rounded-full bg-blue-100 p-4'>
                    <MapPin className='h-8 w-8 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Alamat</p>
                    <p className='text-3xl font-bold text-gray-800'>
                      {user.address?.length || 0}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-6 bg-gray-50 p-6 rounded-xl'>
                  <div className='rounded-full bg-green-100 p-4'>
                    <ShoppingBag className='h-8 w-8 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Pesanan</p>
                    <p className='text-3xl font-bold text-gray-800'>
                      {user.order?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='space-y-6'>
          <Card className='shadow-lg border-none bg-white rounded-xl overflow-hidden'>
            <CardContent className='p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Alamat</h2>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedAddress(null)
                    setIsAddressDialogOpen(true)
                  }}
                  className='gap-2 hover:bg-gray-50 transition-all'>
                  <Plus className='h-4 w-4' />
                  Tambah Alamat
                </Button>
              </div>
              {user.address && user.address.length > 0 ? (
                <div className='space-y-4'>
                  {sortedAddress.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => {
                        setSelectAddress(address.id)
                        setDisabled(false)
                      }}
                      className={cn(
                        'flex items-start justify-between rounded-xl border-2 bg-white p-6 cursor-pointer transition-all hover:shadow-md',
                        selectAddress === address.id
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-gray-200'
                      )}>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              selectAddress === address.id
                                ? 'text-blue-600'
                                : ''
                            )}>
                            {selectAddress === address.id && (
                              <Check size={16} className='text-blue-600' />
                            )}
                            <p className='text-sm font-medium text-gray-500'>
                              {address.labelAddress}
                            </p>
                          </div>
                        </div>
                        <p className='font-semibold text-gray-800'>
                          {address.recipientName}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {address.address}
                        </p>
                        <p className='text-sm text-gray-500'>
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
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAddress(address)
                            setIsAddressDialogOpen(true)
                          }}
                          className='hover:bg-gray-100'>
                          <Edit2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAddress(address)
                            setIsDeleteDialogOpen(true)
                          }}
                          className='hover:bg-red-600'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className='flex justify-end mt-6'>
                    <Button
                      variant='outline'
                      className='bg-white hover:bg-gray-50 transition-all'
                      disabled={disabled}
                      onClick={handleSetActiveAddress}>
                      {isPending ? 'Memilih...' : 'Pilih Alamat'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <div className='rounded-full bg-blue-50 p-6'>
                    <MapPin className='h-12 w-12 text-blue-500' />
                  </div>
                  <h3 className='mt-6 text-xl font-semibold text-gray-800'>
                    Belum ada alamat
                  </h3>
                  <p className='mt-2 text-sm text-gray-500'>
                    Tambahkan alamat untuk memudahkan pengiriman
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSelectedAddress(null)
                      setIsAddressDialogOpen(true)
                    }}
                    className='mt-8 hover:bg-gray-50 transition-all'>
                    Tambah Alamat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className='flex justify-end'>
          <Button
            variant='destructive'
            onClick={handleLogout}
            className='gap-2 hover:bg-red-600 transition-all'>
            <LogOut className='h-4 w-4' />
            Logout
          </Button>
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
              <DialogTitle className='text-xl font-bold text-gray-800'>
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
              <DialogTitle className='text-xl font-bold text-gray-800'>
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
          <AlertDialogContent className='bg-white rounded-xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-xl font-bold text-gray-800'>
                Hapus Alamat
              </AlertDialogTitle>
              <AlertDialogDescription className='text-gray-600'>
                Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak
                dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='hover:bg-gray-100'>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAddress}
                className='bg-red-600 hover:bg-red-700'>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default ProfileClient
