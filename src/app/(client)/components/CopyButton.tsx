'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    toast.success('Nomor VA berhasil disalin!')
  }
  return (
    <Button
      type='button'
      className='text-xs h-fit'
      variant='default'
      onClick={handleCopy}>
      salin
    </Button>
  )
}
