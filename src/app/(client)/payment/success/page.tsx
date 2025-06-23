import { Suspense } from 'react'
import dynamicImport from 'next/dynamic'

const PaymentSuccessClient = dynamicImport(
  () => import('./PaymentSuccessClient'),
  {
    ssr: false,
    loading: () => null,
  }
)

export const dynamic = 'force-dynamic'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessClient />
    </Suspense>
  )
}
