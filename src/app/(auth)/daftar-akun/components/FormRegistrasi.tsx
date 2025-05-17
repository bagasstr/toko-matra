'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { registrasi } from '@/app/actions/registrasi'
import { verificationOtp } from '@/app/actions/verificationToken'
import { resendOtp } from '@/app/actions/resendOtp'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

// Definisi tipe akun
const accountTypes = [
  { id: 'personal', name: 'Personal' },
  { id: 'company', name: 'Perusahaan' },
  { id: 'store', name: 'Toko' },
]

// Definisi skema form dengan Zod untuk Step 1
const registerSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  typeUser: z.string({ required_error: 'Silakan pilih jenis akun' }),
  name: z.string().min(2, { message: 'Nama harus minimal 2 karakter' }),
  password: z
    .string()
    .min(8, { message: 'Password harus minimal 8 karakter' })
    .regex(/[A-Z]/, {
      message: 'Password harus mengandung minimal 1 huruf kapital',
    })
    .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' }),
})

// Definisi skema form dengan Zod untuk Step 2
const otpSchema = z.object({
  otp: z.string().length(6, { message: 'Kode OTP harus 6 digit' }),
})

// Tipe untuk data form gabungan
type RegisterFormData = z.infer<typeof registerSchema>
type OtpFormData = z.infer<typeof otpSchema>

// Tipe untuk respons dari server action
type RegistrationResponse = {
  success?: boolean
  error?: string
  email?: string
  message?: string
}

export default function RegisterForm() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Inisialisasi form untuk Step 1
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      typeUser: '',
      name: '',
      password: '',
    },
  })

  // Inisialisasi form untuk Step 2
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  // Timer untuk OTP
  useEffect(() => {
    if (step !== 2) return

    // Reset timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeLeft(60)
    setCanResend(false)

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setCanResend(true)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step])

  // Handler submit untuk Step 1
  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      setIsSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('typeUser', values.typeUser)
      formData.append('name', values.name)
      formData.append('password', values.password)

      const result = await registrasi(formData)

      if (result?.success) {
        setRegisteredEmail(values.email)
        setSuccess('OTP telah dikirim ke email Anda')
        setStep(2)
      } else {
        setError(result?.error || 'Terjadi kesalahan saat pendaftaran')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Terjadi kesalahan saat pendaftaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler submit untuk Step 2
  async function onOtpSubmit(values: OtpFormData) {
    try {
      setIsSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append('otp', values.otp)
      formData.append('email', registeredEmail || '')

      // Simulasi verifikasi OTP
      // Dalam implementasi nyata, Anda akan memanggil server action verifyOtp
      await verificationOtp(formData)

      // Simulasi sukses
      setSuccess('Verifikasi berhasil! Akun Anda telah aktif.')
      setIsRegistrationComplete(true)
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('Terjadi kesalahan saat verifikasi OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler untuk kirim ulang OTP
  async function handleResendOtp() {
    if (!canResend) return

    try {
      setIsResending(true)
      setError(null)

      // Simulasi pengiriman ulang OTP
      // Dalam implementasi nyata, Anda akan memanggil server action resendOtp
      await resendOtp(registeredEmail || '')

      setSuccess('OTP baru telah dikirim ke email Anda')
      setTimeLeft(60)
      setCanResend(false)

      // Restart timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setCanResend(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError('Terjadi kesalahan saat mengirim ulang OTP')
    } finally {
      setIsResending(false)
    }
  }

  // Fungsi untuk kembali ke step sebelumnya
  function goBack() {
    setStep(1)
    setError(null)
    setSuccess(null)
  }

  // Render indikator step
  const renderStepIndicator = () => {
    return (
      <div className='flex items-center justify-center mb-6'>
        <div className='flex items-center'>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary'
            )}>
            1
          </div>
          <div className='w-16 h-1 bg-muted mx-2'>
            <div
              className={cn(
                'h-full bg-primary transition-all',
                step === 1 ? 'w-0' : 'w-full'
              )}
            />
          </div>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === 2
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary'
            )}>
            2
          </div>
        </div>
      </div>
    )
  }

  // Render halaman sukses setelah registrasi selesai
  if (isRegistrationComplete) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>Pendaftaran Berhasil</CardTitle>
          <CardDescription>
            Akun Anda telah berhasil dibuat dan diverifikasi
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <div className='rounded-full bg-green-100 p-3 mb-4'>
            <CheckCircle2 className='h-12 w-12 text-green-600' />
          </div>
          <h3 className='text-xl font-semibold mb-2'>Selamat!</h3>
          <p className='text-center text-muted-foreground mb-6'>
            Akun Anda telah berhasil dibuat dan diverifikasi. Anda sekarang
            dapat masuk ke akun Anda.
          </p>
          <Button className='w-full' asChild>
            <a href='/'>Masuk ke Akun</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Daftar Akun</CardTitle>
        <CardDescription>
          {step === 1
            ? 'Buat akun baru untuk mengakses layanan kami'
            : 'Verifikasi email Anda'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}

        {error && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className='mb-6 bg-green-50 border-green-200'>
            <AlertTitle>Sukses</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className='space-y-6'>
              <FormField
                control={registerForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='email@example.com' {...field} />
                    </FormControl>
                    <FormDescription>
                      Email akan digunakan untuk login dan komunikasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name='typeUser'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Akun</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih jenis akun' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih jenis akun yang sesuai dengan kebutuhan Anda
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder='Nama Lengkap' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='********'
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 py-2'
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                          <span className='sr-only'>
                            {showPassword
                              ? 'Sembunyikan password'
                              : 'Tampilkan password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Password harus minimal 8 karakter, mengandung huruf
                      kapital dan angka
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />{' '}
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjutkan <ArrowRight className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
        {step === 2 && (
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className='space-y-6'>
              <div className='text-center mb-8'>
                <p className='text-sm text-muted-foreground'>
                  Kami telah mengirimkan kode OTP ke email
                </p>
                <p className='font-medium'>{registeredEmail}</p>
              </div>

              <FormField
                control={otpForm.control}
                name='otp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex justify-center'>
                      Kode OTP
                    </FormLabel>
                    <FormControl>
                      <div className={cn('flex items-center justify-center')}>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col space-y-2'>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />{' '}
                      Memverifikasi...
                    </>
                  ) : (
                    'Verifikasi'
                  )}
                </Button>

                <div className='flex justify-between items-center mt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={goBack}
                    disabled={isSubmitting}>
                    <ArrowLeft className='mr-2 h-4 w-4' /> Kembali
                  </Button>

                  <div className='text-sm text-right'>
                    <p className='text-muted-foreground'>
                      {canResend ? (
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='p-0 h-auto'
                          onClick={handleResendOtp}
                          disabled={isResending}>
                          {isResending ? (
                            <>
                              <RefreshCw className='mr-1 h-3 w-3 animate-spin' />{' '}
                              Mengirim...
                            </>
                          ) : (
                            'Kirim ulang OTP'
                          )}
                        </Button>
                      ) : (
                        <>
                          Kirim ulang dalam{' '}
                          <span className='font-medium'>{timeLeft}s</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className='flex justify-center'>
        <p className='text-sm text-muted-foreground'>
          Sudah memiliki akun?{' '}
          <a href='#' className='text-primary underline underline-offset-4'>
            Masuk di sini
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
