import * as z from 'zod'

export const addressSchema = z.object({
  labelAddress: z.string().min(1, 'Label alamat harus diisi'),
  recipientName: z.string().min(1, 'Nama penerima harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  city: z.string().min(1, 'Kota harus diisi'),
  district: z.string().min(1, 'Kecamatan harus diisi'),
  villages: z.string().min(1, 'Desa harus diisi'),
  province: z.string().min(1, 'Provinsi harus diisi'),
  postalCode: z.string().min(1, 'Kode pos harus diisi'),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export interface AddressData {
  labelAddress: string
  recipientName: string
  address: string
  city: string
  district: string
  villages: string
  province: string
  postalCode: string
}

export interface AreaItem {
  code: string
  name: string
  postal_code?: string
}
