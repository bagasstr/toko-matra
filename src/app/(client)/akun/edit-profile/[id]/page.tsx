'use client'

import { getUser } from '@/app/actions/profileAction'
import { updateProfile } from '@/app/actions/updateProfile'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Schema untuk validasi form
const profileSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap harus diisi'),
  userName: z.string().min(1, 'Nama pengguna harus diisi'),
  phoneNumber: z.string().min(1, 'Nomor telepon harus diisi'),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      userName: '',
      gender: '',
      dateOfBirth: '',
    },
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(Number(id))
        setUser(userData)

        // Mengisi form dengan data pengguna yang ada
        if (userData?.profile) {
          form.reset({
            fullName: userData.profile.fullName || '',
            userName: userData.profile.userName || '',
            phoneNumber: userData.profile.phoneNumber || '',
            gender: userData.profile.gender || '',
            dateOfBirth: userData.profile.dateOfBirth || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Gagal memuat data pengguna')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id, form])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const result = await updateProfile(Number(id), data)

      if (result.success) {
        toast.success('Profil berhasil diperbarui')
        router.push(`/akun/${id}`)
      } else {
        toast.error(result.error || 'Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl font-semibold text-gray-600'>Memuat...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl font-semibold text-gray-600'>
          Profil pengguna tidak ditemukan
        </p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {/* Header */}
        <div className='bg-secondary p-6 text-secondary-foreground flex justify-between items-center'>
          <h1 className='text-2xl font-semibold'>Edit Profil</h1>
          <Link href={`/akun/${id}`}>
            <Button
              variant='outline'
              className='hover:bg-muted text-foreground'>
              Kembali
            </Button>
          </Link>
        </div>

        <div className='p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder='Nama Lengkap' {...field} />
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
                    <FormLabel>Nama Pengguna</FormLabel>
                    <FormControl>
                      <Input placeholder='Nama Pengguna' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder='Nomor Telepon' {...field} />
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
                        <SelectItem value='Laki-laki'>Laki-laki</SelectItem>
                        <SelectItem value='Perempuan'>Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className='flex justify-end'>
                <Button type='submit'>Simpan Perubahan</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
