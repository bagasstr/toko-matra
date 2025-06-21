'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  requestPasswordReset,
  verifyAndResetPassword,
} from '@/app/actions/forgotPassword'

const emailSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'Kode OTP harus 6 digit'),
  newPassword: z
    .string()
    .min(8, 'Password harus minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
})

type EmailFormData = z.infer<typeof emailSchema>
type OtpFormData = z.infer<typeof otpSchema>

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
    },
  })

  const onSubmitEmail = async (data: EmailFormData) => {
    try {
      setIsLoading(true)
      const result = await requestPasswordReset(data.email)

      if (result.success) {
        setEmail(data.email)
        setStep(2)
        toast.success(result.message)
      } else if (result.cooldownRemaining) {
        setResendCooldown(result.cooldownRemaining)
        toast.error(result.error)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      toast.error('Terjadi kesalahan saat memproses permintaan')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitOtp = async (data: OtpFormData) => {
    try {
      setIsLoading(true)
      const result = await verifyAndResetPassword(
        email,
        data.otp,
        data.newPassword
      )

      if (result.success) {
        toast.success(result.message)
        router.push('/login')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Password reset verification error:', error)
      toast.error('Terjadi kesalahan saat memverifikasi dan mengubah password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    try {
      setIsLoading(true)
      const result = await requestPasswordReset(email)

      if (result.success) {
        toast.success(result.message)
        setResendCooldown(2) // 2 minutes cooldown
      } else if (result.cooldownRemaining) {
        setResendCooldown(result.cooldownRemaining)
        toast.error(result.error)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Terjadi kesalahan saat mengirim ulang OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='grid gap-6'>
      {step === 1 ? (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className='space-y-4'>
            <FormField
              control={emailForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='nama@email.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Kirim Kode OTP'}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            className='space-y-4'>
            <div className='text-center mb-4'>
              <p className='text-sm text-muted-foreground'>
                Kode OTP telah dikirim ke
              </p>
              <p className='font-medium'>{email}</p>
            </div>

            <FormField
              control={otpForm.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode OTP</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={otpForm.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Masukkan password baru'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Reset Password'}
            </Button>

            <div className='text-center'>
              <Button
                type='button'
                variant='link'
                onClick={handleResendOtp}
                disabled={isLoading || resendCooldown > 0}>
                {resendCooldown > 0
                  ? `Kirim Ulang OTP (${resendCooldown} menit)`
                  : 'Kirim Ulang OTP'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
