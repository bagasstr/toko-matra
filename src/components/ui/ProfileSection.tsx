'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { logout } from '@/app/actions/session';
import { toast } from 'sonner';
import EditProfileForm from './EditProfileForm';
import EditAddressForm from './EditAddressForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteAddress } from '@/app/actions/address';

interface ProfileSectionProps {
  user: {
    id: number;
    email: string;
    emailVerified: Date | null;
    profile: {
      fullName: string;
      userName: string;
      imageUrl: string;
      phoneNumber: string;
      gender: 'male' | 'female' | 'other';
      dateOfBirth: string;
      bio?: string;
      companyName?: string;
      taxId?: string;
    } | null;
    address: any[];
    order: any[];
    review: any[];
  };
}

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const router = useRouter();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil logout');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    }
  };

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;

    try {
      const result = await deleteAddress(selectedAddress.id);
      if (!result.success) {
        toast.error(result.error || 'Gagal menghapus alamat');
        return;
      }

      toast.success('Alamat berhasil dihapus');
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Terjadi kesalahan saat menghapus alamat');
    }
  };

  return (
    <div className='container mx-auto py-8'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Profile Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Informasi Profil</CardTitle>
            <Dialog
              open={isProfileDialogOpen}
              onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Edit2 className='mr-2 h-4 w-4' />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profil</DialogTitle>
                </DialogHeader>
                <EditProfileForm
                  user={{
                    id: user.id,
                    profile: {
                      fullName: user.profile?.fullName || '',
                      userName: user.profile?.userName || '',
                      phoneNumber: user.profile?.phoneNumber || '',
                      gender: user.profile?.gender || 'male',
                      dateOfBirth: user.profile?.dateOfBirth || '',
                      bio: user.profile?.bio || '',
                      companyName: user.profile?.companyName || '',
                      taxId: user.profile?.taxId || '',
                    },
                  }}
                  onSuccess={() => {
                    setIsProfileDialogOpen(false);
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage src={user.profile?.imageUrl} />
                <AvatarFallback>
                  {user.profile?.fullName?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className='text-lg font-semibold'>
                  {user.profile?.fullName}
                </h3>
                <p className='text-sm text-gray-500'>
                  {user.profile?.userName}
                </p>
                <p className='text-sm text-gray-500'>{user.email}</p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <User className='h-4 w-4' />
                  <span>
                    Bergabung sejak{' '}
                    {new Date(user.emailVerified || '').toLocaleDateString(
                      'id-ID'
                    )}
                  </span>
                </div>
                {user.profile?.phoneNumber && (
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Phone className='h-4 w-4' />
                    <span>{user.profile.phoneNumber}</span>
                  </div>
                )}
                {user.profile?.gender && (
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <User2 className='h-4 w-4' />
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
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {new Date(user.profile.dateOfBirth).toLocaleDateString(
                        'id-ID'
                      )}
                    </span>
                  </div>
                )}
              </div>

              {user.profile?.bio && (
                <div className='space-y-2'>
                  <h4 className='font-medium'>Bio</h4>
                  <p className='text-sm text-gray-500'>{user.profile.bio}</p>
                </div>
              )}
            </div>

            {(user.profile?.companyName || user.profile?.taxId) && (
              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-medium'>Informasi Bisnis</h4>
                <div className='grid gap-2 md:grid-cols-2'>
                  {user.profile.companyName && (
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <Building2 className='h-4 w-4' />
                      <span>{user.profile.companyName}</span>
                    </div>
                  )}
                  {user.profile.taxId && (
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <Receipt className='h-4 w-4' />
                      <span>{user.profile.taxId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-blue-500' />
                <div>
                  <p className='text-sm font-medium'>Alamat</p>
                  <p className='text-2xl font-bold'>
                    {user.address?.length || 0}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <ShoppingBag className='h-5 w-5 text-green-500' />
                <div>
                  <p className='text-sm font-medium'>Pesanan</p>
                  <p className='text-2xl font-bold'>
                    {user.order?.length || 0}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Star className='h-5 w-5 text-yellow-500' />
                <div>
                  <p className='text-sm font-medium'>Ulasan</p>
                  <p className='text-2xl font-bold'>
                    {user.review?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address List */}
      <Card className='mt-6'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Daftar Alamat</CardTitle>
          <Dialog
            open={isAddressDialogOpen}
            onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Tambah Alamat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Alamat Baru</DialogTitle>
              </DialogHeader>
              <EditAddressForm
                address={{
                  id: 0,
                  recipientName: '',
                  address: '',
                  city: '',
                  postalCode: '',
                  isPrimary: user.address?.length === 0,
                }}
                onSuccess={() => {
                  setIsAddressDialogOpen(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {user.address?.map((address) => (
              <div
                key={address.id}
                className='flex items-start justify-between rounded-lg border p-4'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-medium'>{address.recipientName}</h4>
                    {address.isPrimary && (
                      <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600'>
                        Default
                      </span>
                    )}
                  </div>
                  <p className='text-sm'>{address.address}</p>
                  <p className='text-sm'>
                    {address.city}, {address.postalCode}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleEditAddress(address)}>
                    <Edit2 className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      setSelectedAddress(address);
                      setIsDeleteDialogOpen(true);
                    }}>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='mt-6 flex justify-end'>
        <Button
          variant='destructive'
          onClick={handleLogout}
          className='flex items-center gap-2'>
          <LogOut className='h-4 w-4' />
          Logout
        </Button>
      </div>

      {/* Edit Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <EditAddressForm
              address={selectedAddress}
              onSuccess={() => {
                setIsAddressDialogOpen(false);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Address Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSection;
