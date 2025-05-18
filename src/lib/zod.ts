import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export const regisSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  typeUser: z.string().min(3, 'Type User must be at least 3 characters'),
  otp: z.string().min(4).optional(),
})

// Helper schemas
const decimalSchema = z
  .union([
    z.string().regex(/^\d+\.?\d*$/, 'Must be a valid decimal number'),
    z.number().positive('Must be positive'),
  ])
  .transform((val) => new String(val)) // Convert to string for Prisma Decimal

const dimensionsSchema = z
  .string()
  .regex(/^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/, {
    message: 'Dimensions must be in "PxLxT" format (e.g., "10x5x3")',
  })
  .optional()

const jsonSchema = z.record(z.any()).optional()

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  sku: z.string().min(1, 'SKU harus diisi'),
  description: z.string().optional(),
  images: z.array(z.string()),
  price: z.number().min(1, 'Harga harus diisi'),
  unit: z.string().min(1, 'Satuan harus diisi'),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  brandId: z.string().optional(),
  stock: z.number().min(0, 'Stok harus berupa angka'),
  minOrder: z.string().superRefine((val, ctx) => {
    if (val === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal order harus diisi',
      })
    }
    if (isNaN(Number(val))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal order harus berupa angka',
      })
    }
  }),
  multiOrder: z.string().superRefine((val, ctx) => {
    if (val === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kelipatan order harus diisi',
      })
    }
    if (isNaN(Number(val))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kelipatan order harus berupa angka',
      })
    }
  }),
})

export type CreateProductSchema = z.infer<typeof createProductSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type RegisSchema = z.infer<typeof regisSchema>
