'use client'

import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { login } from '@/app/actions/login'
import { loginSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useModalLogin, useRefresh } from '@/hooks/zustandStore'
import Link from 'next/link'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import { Eye, EyeOff, X } from 'lucide-react'
import { z } from 'zod'
import { cn } from '@/lib/utils'

type LoginInput = z.infer<typeof loginSchema>

const FormLogin = () => {
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()
  const { close } = useModalLogin()
  const [eye, setEye] = useState(false)
  const { triggerRefresh } = useRefresh()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setFormError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)

    if (result?.success) {
      close() // Tutup modal
    } else {
      router.push('/') // Navigasi ke halaman utama
    }
  }

  return (
    <>
      <div className={cn('bg-black/50 absolute left-0 top-0 w-full h-full')} />
      <div
        className={cn(
          'absolute top-1/2 left-1/2 z-50 w-[80%] md:w-[30%] -translate-x-1/2 -translate-y-1/2 border p-4 rounded-md bg-background shadow'
        )}>
        <div className='flex items-center justify-between mb-10'>
          <span className='text-2xl font-semibold text-center'>Masuk</span>
          <Button onClick={close} variant='outline' size='icon'>
            <X className='size-5' />
          </Button>
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
            <div className='relative'>
              <Input
                type={eye ? 'text' : 'password'}
                placeholder='********'
                {...register('password')}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute right-0 top-0 h-full px-3 py-2'
                onClick={() => setEye(!eye)}>
                {eye ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
                <span className='sr-only'>
                  {eye ? 'Sembunyikan password' : 'Tampilkan password'}
                </span>
              </Button>
            </div>
          </div>

          {formError && <p className='text-sm text-red-500'>{formError}</p>}

          <div className='flex justify-between items-center text-sm'>
            <Link
              href='/lupa-password'
              className='text-blue-600 hover:underline'>
              Lupa Password?
            </Link>
            <span className='text-muted-foreground'>
              Belum punya akun?{' '}
              <Link href='/daftar' className='underline'>
                Daftar
              </Link>
            </span>
          </div>

          <Button type='submit' className='w-full mt-4' disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </>
  )
}

export default FormLogin
