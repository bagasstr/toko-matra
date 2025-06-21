'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
export default function KategoriLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  return (
    <section className='pb-32 container mx-auto px-4 2xl:px-8 py-4'>
      <main className=''>
        <Button
          onClick={() => router.back()}
          size='icon'
          className='mb-2'
          variant='ghost'>
          <ArrowLeft />
        </Button>
        {children}
      </main>
    </section>
  )
}
