'use client'

import { getUser } from '@/app/actions/profileAction'
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
import { toast } from 'sonner'
import { addAddress, getAddress } from '@/app/actions/addressAction'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProvince } from '@/app/actions/areaDataAction'
import { useAreaData } from '@/hooks/zustandStore'

// Schema untuk validasi form alamat
const addressSchema = z.object({
  labelAddress: z.string().min(1, 'Label alamat harus diisi'),
  recipientName: z.string().min(1, 'Nama penerima harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  city: z.string().min(1, 'Kota harus diisi'),
  district: z.string().min(1, 'Kecamatan harus diisi'),
  villages: z.string().min(1, 'Desa harus diisi'),
  province: z.string().min(1, 'Provinsi harus diisi'),
  postalCode: z.string().min(1, 'Kode pos harus diisi'),
})

type AddressFormValues = z.infer<typeof addressSchema>

export default function AddAddressPage({
  selectedAddress,
  addressId,
  onClose,
}: {
  selectedAddress?: boolean
  addressId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [address, setAddress] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const {
    prov,
    city,
    district,
    village,

    fetchProvince,
    fetchCity,
    fetchDistrict,
    fetchVillage,
  } = useAreaData()

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      labelAddress: '',
      recipientName: '',
      address: '',
      city: '',
      district: '',
      villages: '',
      province: '',
      postalCode: '',
    },
  })
  // Mengambil data provinsi, kota, kecamatan, dan desa dari store
  const watchProvince = form.watch('province')
  const watchCity = form.watch('city')
  const watchDistrict = form.watch('district')
  const watchVillage = form.watch('villages')

  // Mendapatkan kode provinsi, kota, kecamatan, dan desa dari state
  const codeProv = prov.find((item) => item.name === watchProvince)
  const codeCity = city.find((item) => item.name === watchCity)
  const codeDistrict = district.find((item) => item.name === watchDistrict)
  const villageCode = village.find((item) => item.name === watchVillage)

  // Mengambil data provinsi saat komponen pertama kali dimuat
  useEffect(() => {
    const address = async () => {
      const res = await getAddress(addressId)
      if (res.success) {
        setIsLoading(false)
        setAddress(res.data)
      }
    }
    address()
  }, [addressId])

  useEffect(() => {
    fetchProvince()
    setIsLoading(false)
  }, [])

  // Update kota ketika provinsi berubah
  useEffect(() => {
    if (watchProvince) {
      fetchCity(codeProv?.code || '')
      form.setValue('city', '')
      form.setValue('district', '')
      form.setValue('villages', '')
    }
  }, [watchProvince, form])

  // Update kecamatan ketika kota berubah
  useEffect(() => {
    if (watchCity) {
      fetchDistrict(codeCity?.code || '')
      form.setValue('district', '')
      form.setValue('villages', '')
    }
  }, [watchCity, form])

  // Update desa ketika kecamatan berubah
  useEffect(() => {
    if (watchDistrict) {
      fetchVillage(codeDistrict?.code || '')
    }
  }, [watchDistrict, watchVillage, form])

  // Update kode pos ketika desa berubah
  useEffect(() => {
    if (watchVillage) {
      form.setValue('postalCode', villageCode?.postal_code || '')
    }
  }, [watchVillage, villageCode, form])

  const onSubmit = async (data: AddressFormValues) => {
    try {
      const result = await addAddress(addressId, data)

      if (result.success) {
        toast.success('Alamat berhasil diperbarui')
        router.push(`/profile`)
      } else {
        toast.error(result.error || 'Gagal memperbarui alamat')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Gagal memperbarui alamat')
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl font-semibold text-gray-600'>Memuat...</p>
      </div>
    )
  }

  if (address.id && !address) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl font-semibold text-gray-600'>
          Alamat tidak ditemukan
        </p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='bg-white rounded-lg shadow-md'>
        {/* Header */}

        <div className='p-6 max-h-[calc(100vh-12rem)]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='labelAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label Alamat</FormLabel>
                    <FormControl>
                      <Input placeholder='Rumah, Kantor, dll' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='recipientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Penerima</FormLabel>
                    <FormControl>
                      <Input placeholder='Nama Penerima' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Alamat Lengkap' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='province'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(code) => {
                            const selectedProv = prov.find(
                              (item) => item.code === code
                            )

                            if (selectedProv) {
                              field.onChange(selectedProv?.name)
                            }
                          }}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Pilih Provinsi' />
                          </SelectTrigger>
                          <SelectContent>
                            {prov.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota/Kab</FormLabel>
                      <FormControl>
                        <Select
                          disabled={!watchProvince}
                          onValueChange={(code) => {
                            const selectedCity = city.find(
                              (item) => item.code === code
                            )
                            if (selectedCity) {
                              field.onChange(selectedCity.name)
                              fetchCity(code)
                            }
                          }}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Pilih Kota' />
                          </SelectTrigger>
                          <SelectContent>
                            {city.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='district'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan</FormLabel>
                      <FormControl>
                        <Select
                          disabled={!watchCity}
                          onValueChange={(code) => {
                            const selectedDistrict = district.find(
                              (item) => item.code === code
                            )
                            if (selectedDistrict) {
                              field.onChange(selectedDistrict.name)
                            }
                          }}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Pilih Kecamatan' />
                          </SelectTrigger>
                          <SelectContent>
                            {district.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='villages'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelurahan</FormLabel>
                      <FormControl>
                        <Select
                          disabled={!watchDistrict}
                          onValueChange={(code) => {
                            const selectedVillage = village.find(
                              (item) => item.code === code
                            )

                            if (selectedVillage) {
                              field.onChange(selectedVillage.name)
                            }
                          }}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Pilih Provinsi' />
                          </SelectTrigger>
                          <SelectContent>
                            {village.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pos</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Kode Pos'
                          disabled={!watchVillage}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-end'>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
