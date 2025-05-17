'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createBrand } from '@/app/actions/brandAction';

const formSchema = z.object({
  nameBrand: z.string().min(2, {
    message: 'Nama brand harus minimal 2 karakter.',
  }),
});

type Brand = {
  value: number;
  label: string;
};

interface AddBrandFormProps {
  brands: Brand[];
  onSuccess: () => void;
}

export default function AddBrandForm({ brands, onSuccess }: AddBrandFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameBrand: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await createBrand({
        nameBrand: values.nameBrand,
      });
      if (result.success) {
        toast.success('Brand berhasil ditambahkan');
        form.reset();
        onSuccess();
      } else {
        toast.error(result.error || 'Gagal menambah brand');
      }
    } catch (error) {
      toast.error('Gagal menambah brand');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='nameBrand'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tambah Brand Baru</FormLabel>
              <FormControl>
                <div className='flex gap-2'>
                  <Input {...field} placeholder='Nama brand' />
                  <Button type='submit' disabled={loading}>
                    {loading ? 'Menambah...' : 'Tambah'}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
