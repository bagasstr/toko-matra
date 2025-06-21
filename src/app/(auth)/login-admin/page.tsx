'use client'

import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { login } from '@/app/actions/login'
import { loginSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useModalLogin, useRefresh } from '@/hooks/zustandStore'
import Link from 'next/link'
import { X, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type LoginInput = z.infer<typeof loginSchema>

const LoginAdmin = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)

    if (result?.success) {
      toast.success('Login berhasil!')
      router.push('/dashboard')
    } else {
      // Tampilkan error dari server
      toast.error(result?.error || 'Terjadi kesalahan saat login')
    }
  }

  return (
    <>
      <div
        className={cn(
          'bg-black/50 absolute left-0 right-0 top-0 w-full mx-auto h-full'
        )}
      />
      <div
        className={cn(
          'absolute top-1/2 left-0 right-0 z-50 w-[25%] mx-auto -translate-y-1/2 border p-4 rounded-md bg-background shadow'
        )}>
        <div className='mb-8'>
          <span className='text-2xl font-semibold text-center'>
            Masuk sebagai admin
          </span>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className={cn('space-y-2')}>
            <Label>Email</Label>
            <Input type='email' {...register('email')} />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email.message}</p>
            )}
          </div>

          <div className={cn('space-y-2')}>
            <Label>Password</Label>
            <Input type='password' {...register('password')} />
            {errors.password && (
              <p className='text-sm text-red-500'>{errors.password.message}</p>
            )}
          </div>

          <Button type='submit' className='w-full mt-4' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </div>
    </>
  )
}

export default LoginAdmin
