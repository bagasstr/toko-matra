import { Suspense } from 'react'
import VerificationForm from './VerificationForm'

export default function VerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationForm />
    </Suspense>
  )
}
