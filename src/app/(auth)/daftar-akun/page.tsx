import { cn } from '@/lib/utils'
import FormRegistrasi from './components/FormRegistrasi'

const Login = () => {
  return (
    <section className={cn('flex items-center justify-center h-[100vh]')}>
      <FormRegistrasi />
    </section>
  )
}
export default Login
