import ForgotPasswordForm from './components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className='container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Lupa Password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Masukkan email Anda untuk menerima kode OTP
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
