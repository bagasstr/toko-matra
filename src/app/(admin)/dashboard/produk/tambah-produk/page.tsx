'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema, CreateProductSchema } from '@/lib/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormControl,
} from '@/components/ui/form'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from '@/components/ui/command'
import { ChevronsUpDown, Check, Trash, X } from 'lucide-react'
import { toast } from 'sonner'
import { getAllCategories } from '@/app/actions/categoryAction'
import { createProduct } from '@/app/actions/productAction'
import { getAllBrands } from '@/app/actions/brandAction'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadProductImages } from '@/app/actions/productAction'
import { useRouter } from 'next/navigation'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Control, ControllerRenderProps } from 'react-hook-form'

// Komponen upload gambar sederhana
function ImageUpload({
  value,
  onChange,
  previews,
  setPreviews,
  setSelectedFiles,
}: {
  value: string[]
  onChange: (val: string[]) => void
  previews: string[]
  setPreviews: React.Dispatch<React.SetStateAction<string[]>>
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...previewUrls])
    setSelectedFiles((prev) => [...prev, ...files])

    // Clear the input
    e.target.value = ''
  }

  function removeImage(idx: number) {
    const newPreviews = [...previews]
    const newUrls = [...value]
    newPreviews.splice(idx, 1)
    newUrls.splice(idx, 1)
    setPreviews(newPreviews)
    onChange(newUrls)
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className='flex items-center gap-4'>
        <Input
          type='file'
          multiple
          accept='image/*'
          onChange={handleFiles}
          disabled={uploading}
          className='block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100'
        />
        {uploading && (
          <span className='text-sm text-gray-500'>Mengupload...</span>
        )}
      </div>
      <div className='grid grid-cols-4 gap-4 mt-4'>
        {previews.map((url, idx) => (
          <div key={idx} className='relative group'>
            <img
              src={url}
              alt='preview'
              className='w-full h-24 object-cover rounded-lg'
            />
            <button
              type='button'
              onClick={() => removeImage(idx)}
              className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DimensionsInputProps {
  control: Control<any>
  field: ControllerRenderProps<any, 'dimensions'>
}

const DimensionsInput: React.FC<DimensionsInputProps> = ({
  control,
  field,
}) => {
  const parseDimensions = (value: string) => {
    const [panjang = '', lebar = '', tinggi = ''] = value.split('x')
    return { panjang, lebar, tinggi }
  }

  const handleDimensionChange = (
    type: 'panjang' | 'lebar' | 'tinggi',
    newValue: string
  ) => {
    const currentDimensions = parseDimensions(field.value)
    const updatedDimensions = {
      ...currentDimensions,
      [type]: newValue.trim(),
    }

    // Format: Panjang cm x Lebar cm x Tinggi cm
    const dimensionsString = `${updatedDimensions.panjang}x${updatedDimensions.lebar}x${updatedDimensions.tinggi}`
    field.onChange(dimensionsString)
  }

  const { panjang, lebar, tinggi } = parseDimensions(field.value)

  return (
    <FormItem>
      <FormLabel>Dimensi (PxLxT)</FormLabel>
      <div className='flex space-x-2'>
        <FormControl>
          <Input
            value={panjang}
            onChange={(e) => handleDimensionChange('panjang', e.target.value)}
            placeholder='Panjang'
            className='w-1/3'
          />
        </FormControl>
        <FormControl>
          <Input
            value={lebar}
            onChange={(e) => handleDimensionChange('lebar', e.target.value)}
            placeholder='Lebar'
            className='w-1/3'
          />
        </FormControl>
        <FormControl>
          <Input
            value={tinggi}
            onChange={(e) => handleDimensionChange('tinggi', e.target.value)}
            placeholder='Tinggi'
            className='w-1/3'
          />
        </FormControl>
      </div>
      <FormDescription>
        Format: Panjang cm x Lebar cm x Tinggi cm
      </FormDescription>
      <FormMessage />
    </FormItem>
  )
}

export default function Page() {
  const router = useRouter()
  const [categories, setCategories] = React.useState<any[]>([])
  const [brands, setBrands] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [slugEdited, setSlugEdited] = React.useState(false)
  const [previews, setPreviews] = React.useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isInitialized, setIsInitialized] = React.useState(false)

  const labels = [
    { value: 'ready_stock', label: 'Ready Stock' },
    { value: 'suplier', label: 'Suplier' },
    { value: 'indent', label: 'Indent' },
  ]
  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      description: '',
      images: [],
      price: '',
      label: '',
      unit: '',
      weight: '',
      dimensions: '',
      isFeatured: false,
      isActive: true,
      categoryId: '',
      brandId: undefined,
      stock: '',
      minOrder: '',
      multiOrder: '',
    },
  })

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
  }

  React.useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      if (name === 'name' && !slugEdited) {
        form.setValue('slug', generateSlug(values.name || ''))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, slugEdited])

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    form.setValue('slug', e.target.value)
  }

  React.useEffect(() => {
    if (!isInitialized) {
      fetchCategories()
      fetchBrands()
      setIsInitialized(true)
    }
  }, [isInitialized])

  async function fetchCategories() {
    try {
      const result = await getAllCategories()
      if (result.success && result.treeCategory) {
        function flatten(cats: any[], level = 0, parentPath = ''): any[] {
          return cats.reduce((acc: any[], cat) => {
            const prefix = '—'.repeat(level)
            const currentPath = parentPath
              ? `${parentPath} > ${cat.name}`
              : cat.name
            const flatCat = {
              value: cat.id,
              label: `${prefix}${level > 0 ? ' ' : ''}${cat.name}`,
              path: currentPath,
              level,
              hasChildren: cat.children && cat.children.length > 0,
              name: cat.name,
              children: cat.children || [],
            }
            return [
              ...acc,
              flatCat,
              ...flatten(cat.children || [], level + 1, currentPath),
            ]
          }, [])
        }
        setCategories(flatten(result.treeCategory))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Gagal mengambil data kategori')
    }
  }

  async function fetchBrands() {
    try {
      const result = await getAllBrands()
      if (result.success && result.brands) {
        setBrands(
          result.brands.map((brand) => ({
            value: brand.id,
            label: brand.name,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.error('Gagal mengambil data brand')
    }
  }

  async function onSubmit(values: CreateProductSchema) {
    if (selectedFiles.length === 0) {
      toast.error('Harap upload minimal 1 gambar produk')
      return
    }

    setLoading(true)
    try {
      // Upload images first using FormData
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const uploadResult = await uploadProductImages(formData)
      if (!uploadResult.success) {
        toast.error('Gagal mengupload gambar')
        setLoading(false)
        return
      }

      const payload = {
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description || undefined,
        images: uploadResult.urls,
        price: Number(values.price),
        unit: values.unit,
        weight: values.weight ? Number(values.weight) : undefined,
        dimensions: values.dimensions || undefined,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        label: values.label,
        categoryId: values.categoryId,
        brandId: values.brandId,
        stock: Number(values.stock),
        minOrder: Number(values.minOrder),
        multiOrder: Number(values.multiOrder),
      }

      const result = await createProduct(payload)
      if (result.success) {
        toast.success('Produk berhasil ditambahkan!')
        // Reset form and states
        form.reset()
        setPreviews([])
        setSelectedFiles([])
        // Redirect to products page
        router.push('/dashboard/produk')
        router.refresh()
      } else {
        toast.error(result.error || 'Gagal menambah produk')
      }
    } catch (e) {
      toast.error('Gagal menambah produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold mb-6'>Tambah Produk</h1>
        <Button onClick={() => router.push('/dashboard/produk')}>
          Kembali
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=''>
          <div className='space-y-6 mb-4'>
            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <Input
                    {...field}
                    placeholder='SKU unik'
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
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
                  <Input {...field} placeholder='Nama produk' />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <Input
                    {...field}
                    placeholder='slug-produk'
                    onChange={handleSlugChange}
                  />
                  <FormDescription>
                    Slug akan terisi otomatis dari nama produk, namun bisa
                    diubah manual jika perlu
                  </FormDescription>
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
                  <Textarea {...field} placeholder='Deskripsi produk' />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Produk</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih label produk' />
                    </SelectTrigger>
                    <SelectContent>
                      {labels.map((label) => (
                        <SelectItem key={label.value} value={label.value}>
                          {label.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih label untuk menandai status produk
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gambar Produk</FormLabel>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    previews={previews}
                    setPreviews={setPreviews}
                    setSelectedFiles={setSelectedFiles}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <Input {...field} type='text' placeholder='Harga' />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <Input {...field} placeholder='kg, m, m2, dll' />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4 items-start'>
              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berat (kg)</FormLabel>
                    <Input type='text' {...field} placeholder='Berat' />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dimensions'
                render={({ field }) => (
                  <DimensionsInput control={form.control} field={field} />
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='stock'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok</FormLabel>
                  <Input type='number' {...field} placeholder='Stok' />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4 items-start'>
              <FormField
                control={form.control}
                name='minOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Order</FormLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        placeholder='Minimal order'
                        min={1}
                        className='pr-12'
                      />
                      <span className='text-sm text-gray-500 absolute right-3 top-1/2 -translate-y-1/2'>
                        {form.watch('unit')}
                      </span>
                    </div>
                    <FormDescription>
                      Jumlah minimal yang harus dipesan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='multiOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelipatan Order</FormLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        placeholder='Kelipatan order'
                        min={0}
                        className='pr-12'
                      />
                      <span className='text-sm text-gray-500 absolute right-3 top-1/2 -translate-y-1/2'>
                        {form.watch('unit')}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-between'>
                        {field.value
                          ? categories.find((cat) => cat.value === field.value)
                              ?.path || 'Pilih kategori'
                          : 'Pilih kategori'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0'>
                      <Command>
                        <CommandInput placeholder='Cari kategori...' />
                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {categories
                            .filter((cat) => cat.level === 0)
                            .map((parentCat) => (
                              <Collapsible key={parentCat.value}>
                                <CollapsibleTrigger className='cursor-pointer w-full'>
                                  <CommandItem
                                    value={parentCat.value.toString()}
                                    className='flex items-center justify-between cursor-pointer'>
                                    <div className='flex items-center'>
                                      {parentCat.name}
                                    </div>
                                    {parentCat.hasChildren && (
                                      <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
                                    )}
                                  </CommandItem>
                                </CollapsibleTrigger>
                                {parentCat.hasChildren && (
                                  <CollapsibleContent>
                                    <div className='ml-4'>
                                      {categories
                                        .filter(
                                          (cat) =>
                                            cat.level > 0 &&
                                            cat.path.startsWith(parentCat.name)
                                        )
                                        .map((childCat) => (
                                          <CommandItem
                                            key={childCat.value}
                                            value={childCat.value.toString()}
                                            onSelect={() =>
                                              field.onChange(childCat.value)
                                            }
                                            className='flex items-center'>
                                            <Check
                                              className={
                                                field.value === childCat.value
                                                  ? 'h-4 w-4 opacity-100'
                                                  : 'h-4 w-4 opacity-0'
                                              }
                                            />
                                            - {childCat.name}
                                          </CommandItem>
                                        ))}
                                    </div>
                                  </CollapsibleContent>
                                )}
                              </Collapsible>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='brandId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-between'>
                        {field.value
                          ? brands.find((brand) => brand.value === field.value)
                              ?.label
                          : 'Pilih brand'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0'>
                      <Command>
                        <CommandInput placeholder='Cari brand...' />
                        <CommandEmpty>Brand tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {brands.map((brand) => (
                            <CommandItem
                              key={brand.value}
                              value={brand.value.toString()}
                              onSelect={() => field.onChange(brand.value)}>
                              <Check
                                className={
                                  field.value === brand.value
                                    ? 'mr-2 h-4 w-4 opacity-100'
                                    : 'mr-2 h-4 w-4 opacity-0'
                                }
                              />
                              {brand.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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
                      Aktifkan/nonaktifkan produk ini
                    </FormDescription>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? 'Menyimpan...' : 'Tambah Produk'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
