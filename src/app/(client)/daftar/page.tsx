'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { registrasi } from '@/app/actions/registrasi';

const formSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(1, 'Password wajib diisi')
      .min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('typeUser', 'user'); // Default type user

      const result = await registrasi(formData);

      if (!result.success) {
        toast.error(result.error || 'Terjadi kesalahan saat mendaftar');
        return;
      }

      toast.success('Pendaftaran berhasil! Silakan verifikasi email Anda.');
      router.push(`/verifikasi?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Terjadi kesalahan saat mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='text-xl font-semibold text-gray-800 mb-2 text-center'>
            Daftar Akun
          </div>

          <FormField
            control={form.control}
            name='name'
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='Masukkan email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Masukkan password'
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-500' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-500' />
                      )}
                      <span className='sr-only'>
                        {showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Masukkan konfirmasi password'
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }>
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-500' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-500' />
                      )}
                      <span className='sr-only'>
                        {showConfirmPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Mendaftar...' : 'Daftar'}
          </Button>

          <div className='text-center text-sm text-gray-500 mt-2'>
            Sudah punya akun?{' '}
            <Link href='/login' className='text-blue-600 hover:underline'>
              Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
