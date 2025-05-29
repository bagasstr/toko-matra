'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { login } from '@/app/actions/login'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
})

type FormValues = z.infer<typeof formSchema>

const LoginPage = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await login(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success('Login berhasil')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Terjadi kesalahan saat login')
    }
  }

  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='text-xl font-semibold text-gray-800 mb-2 text-center'>
            Login
          </div>

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

          <Button type='submit' className='w-full'>
            Login
          </Button>
          <div className='text-center text-sm text-gray-500 mt-2'>
            Lupa password?{' '}
            <Link
              href='/lupapassword'
              className='text-blue-600 hover:underline'>
              Klik disini
            </Link>
          </div>

          <div className='text-center text-sm text-gray-500 mt-2'>
            Belum punya akun?{' '}
            <Link href='/daftar' className='text-blue-600 hover:underline'>
              Daftar
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default LoginPage
