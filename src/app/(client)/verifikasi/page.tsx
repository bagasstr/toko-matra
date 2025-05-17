'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { verificationOtp } from '@/app/actions/verificationToken';

const formSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP wajib diisi')
    .length(6, 'OTP harus 6 digit')
    .regex(/^\d+$/, 'OTP harus berupa angka'),
});

type FormValues = z.infer<typeof formSchema>;

const VerificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  if (!email) {
    router.push('/daftar');
    return null;
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', data.otp);

      const result = await verificationOtp(formData);

      if (!result?.success) {
        toast.error(result?.error || 'Verifikasi gagal');
        return;
      }

      toast.success('Email berhasil diverifikasi');
      router.push('/login');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Terjadi kesalahan saat verifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='text-xl font-semibold text-gray-800 mb-2 text-center'>
            Verifikasi Email
          </div>
          <div className='text-sm text-gray-600 text-center mb-4'>
            Masukkan kode OTP yang telah dikirim ke {email}
          </div>

          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode OTP</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Masukkan 6 digit kode OTP'
                    maxLength={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default VerificationPage;
