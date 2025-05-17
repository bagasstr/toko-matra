'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/profile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'

const formSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  userName: z.string().min(1, 'Username wajib diisi'),
  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Jenis kelamin wajib dipilih',
  }),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),
  bio: z.string().optional(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  imageUrl: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditProfileFormProps {
  user: {
    id: string
    profile: {
      fullName: string
      userName: string
      phoneNumber: string
      gender: 'male' | 'female' | 'other'
      dateOfBirth: string
      bio?: string
      companyName?: string
      taxId?: string
      imageUrl?: string
    } | null
  }
  onSuccess?: () => void
}

const EditProfileForm = ({ user, onSuccess }: EditProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.profile?.imageUrl
  )
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user.profile?.fullName || '',
      userName: user.profile?.userName || '',
      phoneNumber: user.profile?.phoneNumber || '',
      gender: user.profile?.gender || 'other',
      dateOfBirth: user.profile?.dateOfBirth,
      bio: user.profile?.bio || '',
      companyName: user.profile?.companyName || '',
      taxId: user.profile?.taxId || '',
      imageUrl: user.profile?.imageUrl || '',
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        form.setValue('imageUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      const profileData = {
        fullName: data.fullName,
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio,
        companyName: data.companyName,
        taxId: data.taxId,
        imageUrl: data.imageUrl,
      }

      const result = await updateProfile(user.id, profileData)

      if (!result.success) {
        toast.error(result.error || 'Gagal mengupdate profil')
        return
      }

      toast.success('Profil berhasil diupdate')
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Terjadi kesalahan saat mengupdate profil')
    } finally {
      setIsLoading(false)
    }
  }
  console.log(user.profile)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 max-h-[80vh] overflow-y-auto pr-4'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src={previewImage} />
              <AvatarFallback>{user?.profile?.fullName || 'U'}</AvatarFallback>
            </Avatar>
            <label
              htmlFor='avatar-upload'
              className='absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90'>
              <Camera className='h-4 w-4' />
              <input
                id='avatar-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageChange}
              />
            </label>
          </div>
          <p className='text-sm text-muted-foreground'>
            Klik ikon kamera untuk mengubah foto profil
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan nama lengkap' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='userName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan username' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='phoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan nomor telepon' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenis kelamin' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='male'>Laki-laki</SelectItem>
                    <SelectItem value='female'>Perempuan</SelectItem>
                    <SelectItem value='other'>Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='dateOfBirth'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Lahir</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Ceritakan sedikit tentang diri Anda'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4 rounded-lg border p-4'>
          <h3 className='font-medium'>Informasi Bisnis (Opsional)</h3>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='companyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan nama perusahaan' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='taxId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NPWP</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan nomor NPWP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </Form>
  )
}

export default EditProfileForm
