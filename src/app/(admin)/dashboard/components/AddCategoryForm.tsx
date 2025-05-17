'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama kategori harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

type AddCategoryFormProps = {
  categories: { value: string; label: string }[]
  onSuccess: () => void
}

export default function AddCategoryForm({
  categories,
  onSuccess,
}: AddCategoryFormProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: Implementasi API untuk menambah kategori
      console.log('Form values:', values)
      toast.success('Kategori berhasil ditambahkan')
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error('Gagal menambahkan kategori')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full justify-start'>
          + Tambah Kategori Baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan nama kategori' {...field} />
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
                      placeholder='Masukkan deskripsi kategori'
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
              name='parentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Induk (Opsional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih kategori induk' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type='submit'>Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
