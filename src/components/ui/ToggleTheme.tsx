'use client'

import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ToggleTheme = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen hanya dirender di client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}>
      <Button
        variant='outline'
        size='icon'
        onClick={toggleTheme}
        className={cn(
          'focus-visible:ring-0 border-[#047cb9] dark:border-[#061d2b]',
          !mounted && 'invisible'
        )}>
        {resolvedTheme === 'dark' ? (
          <Sun className='h-[1.2rem] w-[1.2rem]' />
        ) : (
          <Moon className='h-[1.2rem] w-[1.2rem]' />
        )}
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </motion.div>
  )
}
export default ToggleTheme
