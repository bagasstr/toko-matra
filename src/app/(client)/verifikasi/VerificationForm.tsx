'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { verificationOtp } from '@/app/actions/verificationToken'
import { resendOtp } from '@/app/actions/resendOtp'

const formSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP wajib diisi')
    .length(6, 'OTP harus 6 digit')
    .regex(/^\d+$/, 'OTP harus berupa angka'),
})

type FormValues = z.infer<typeof formSchema>

export default function VerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpired, setOtpExpired] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    // OTP Expiration Timer
    const otpExpirationTimer = setTimeout(() => {
      setOtpExpired(true)
    }, 5 * 60 * 1000) // 5 minutes

    // Resend Cooldown Timer
    let cooldownTimer: NodeJS.Timeout | null = null
    if (resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }

    // Cleanup timers
    return () => {
      clearTimeout(otpExpirationTimer)
      if (cooldownTimer) clearInterval(cooldownTimer)
    }
  }, [resendCooldown])

  if (!email) {
    router.push('/daftar')
    return null
  }

  const onSubmit = async (data: FormValues) => {
    if (otpExpired) {
      toast.error('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.')
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('email', email)
      formData.append('otp', data.otp)

      const result = await verificationOtp(formData)

      if (!result?.success) {
        toast.error(result?.error || 'Verifikasi gagal')
        return
      }

      toast.success('Email berhasil diverifikasi')
      router.push('/login')
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Terjadi kesalahan saat verifikasi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    try {
      setIsLoading(true)
      const result = await resendOtp(email)

      if (result.success) {
        toast.success(result.message)
        setResendCooldown(120) // 2 minutes cooldown
        setOtpExpired(false) // Reset OTP expiration
      } else if (result.cooldownRemaining) {
        setResendCooldown(result.cooldownRemaining * 60)
        toast.error(result.error)
      } else {
        toast.error(result.error || 'Gagal mengirim ulang OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Terjadi kesalahan saat mengirim ulang OTP')
    } finally {
      setIsLoading(false)
    }
  }

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

          {otpExpired && (
            <div className='text-red-500 text-center mb-4'>
              Kode OTP sudah kedaluwarsa. Silakan minta kode baru.
            </div>
          )}

          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem className='flex flex-col items-center'>
                <FormLabel className='mb-2'>Kode OTP</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value)
                    }}>
                    <InputOTPGroup className='gap-2'>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className='mt-2 text-center' />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full mt-4' disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>

          <div className='text-center mt-4'>
            <Button
              type='button'
              variant='link'
              onClick={handleResendOtp}
              disabled={isLoading || (resendCooldown > 0 && !otpExpired)}>
              {resendCooldown > 0 && !otpExpired
                ? `Kirim Ulang OTP (${Math.floor(resendCooldown / 60)}:${
                    resendCooldown % 60 < 10 ? '0' : ''
                  }${resendCooldown % 60})`
                : 'Kirim Ulang OTP'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
