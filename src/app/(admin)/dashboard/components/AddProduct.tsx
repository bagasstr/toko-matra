'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { addProduct, getCategories } from '@/app/actions/productAction'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import AddCategoryForm from './AddCategoryForm'

const formSchema = z.object({
  sku: z.string().min(3, {
    message: 'SKU harus minimal 3 karakter.',
  }),
  name: z.string().min(3, {
    message: 'Nama produk harus minimal 3 karakter.',
  }),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d+)?$/, {
    message: 'Harga harus berupa angka valid.',
  }),
  stock: z.string().regex(/^\d+$/, {
    message: 'Stok harus berupa angka bulat.',
  }),
  categoryId: z.string().min(1, {
    message: 'Kategori wajib dipilih.',
  }),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export default function AddProductForm() {
  const [categories, setCategories] = useState<any[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      isFeatured: false,
      isActive: true,
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories()
      if (result.success && result.categories) {
        const flattenCategories = (cats: any[], level = 0): any[] => {
          return cats.reduce((acc: any[], cat) => {
            const prefix = '—'.repeat(level)
            const flatCat = {
              value: cat.id.toString(),
              label: `${prefix}${level > 0 ? ' ' : ''}${cat.name}`,
            }
            return [
              ...acc,
              flatCat,
              ...flattenCategories(cat.children || [], level + 1),
            ]
          }, [])
        }
        setCategories(flattenCategories(result.categories))
      }
    }
    fetchCategories()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await addProduct({
        ...values,
        categoryId: values.categoryId,
      })

      if (result.success) {
        toast({
          title: 'Berhasil!',
          description: 'Produk berhasil ditambahkan.',
        })
        router.push('/dashboard/products')
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal!',
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: 'Terjadi kesalahan saat menambahkan produk.',
      })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='sku'
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU Produk</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan SKU produk' {...field} />
                </FormControl>
                <FormDescription>
                  SKU adalah kode unik untuk mengidentifikasi produk
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan nama produk' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Masukkan deskripsi produk'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Masukkan harga produk'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='stock'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Masukkan jumlah stok'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='w-full justify-between'>
                        {field.value
                          ? categories.find(
                              (category) => category.value === field.value
                            )?.label
                          : 'Pilih kategori'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0'>
                      <Command>
                        <div className='p-2'>
                          <AddCategoryForm
                            categories={categories}
                            onSuccess={() => {
                              // Refresh daftar kategori setelah menambah kategori baru
                              const fetchCategories = async () => {
                                const result = await getCategories()
                                if (result.success && result.categories) {
                                  const flattenCategories = (
                                    cats: any[],
                                    level = 0
                                  ): any[] => {
                                    return cats.reduce((acc: any[], cat) => {
                                      const prefix = '—'.repeat(level)
                                      const flatCat = {
                                        value: cat.id.toString(),
                                        label: `${prefix}${
                                          level > 0 ? ' ' : ''
                                        }${cat.name}`,
                                      }
                                      return [
                                        ...acc,
                                        flatCat,
                                        ...flattenCategories(
                                          cat.children || [],
                                          level + 1
                                        ),
                                      ]
                                    }, [])
                                  }
                                  setCategories(
                                    flattenCategories(result.categories)
                                  )
                                }
                              }
                              fetchCategories()
                            }}
                          />
                        </div>
                        <CommandInput placeholder='Cari kategori...' />
                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.value}
                              value={category.value}
                              onSelect={(currentValue) => {
                                field.onChange(
                                  currentValue === field.value
                                    ? ''
                                    : currentValue
                                )
                              }}>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === category.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {category.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='isFeatured'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Produk Unggulan</FormLabel>
                  <FormDescription>
                    Tandai produk ini sebagai produk unggulan
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Status Produk</FormLabel>
                  <FormDescription>
                    Aktifkan atau nonaktifkan produk ini
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className='flex items-center justify-end space-x-2'>
            <Button
              onClick={() => setOpen(false)}
              type='button'
              variant='outline'>
              Kembali
            </Button>
            <Button type='submit'>Tambah Produk</Button>
          </div>
        </form>
      </Form>
    </>
  )
}
