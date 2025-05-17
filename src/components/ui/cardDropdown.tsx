'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Position = 'top' | 'right' | 'bottom' | 'left'

interface FlexibleDropdownProps {
  trigger: ReactNode
  children: ReactNode
  position?: Position
  className?: string
  offset?: number | string // Bisa menerima angka (px) atau string (misal '1rem')
  width?: number
}

export function FlexibleDropdown({
  trigger,
  children,
  position = 'bottom',
  className,
  offset = 0, // default offset 8px
  width = 200,
}: FlexibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Penyesuaian untuk offset dinamis
  const offsetStyle = typeof offset === 'number' ? `${offset}px` : offset

  const positionStyles = {
    top: {
      container: 'flex-col-reverse',
      dropdown: {
        bottom: `calc(100% + ${offsetStyle})`,
        left: '50%',
        transform: 'translateX(-50%)',
      },
    },
    right: {
      container: 'flex-row',
      dropdown: {
        left: `calc(100% + ${offsetStyle})`,
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
    bottom: {
      container: 'flex-col',
      dropdown: {
        paddingTop: `${offsetStyle}`,
        top: '100%',
        left: '-50%',
      },
    },
    left: {
      container: 'flex-row-reverse',
      dropdown: {
        right: `calc(100% + ${offsetStyle})`,
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
  }

  return (
    <div
      className={cn('relative inline-flex', positionStyles[position].container)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}>
      <div className='cursor-pointer'>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md animate-in fade-in-50',
            className
          )}
          style={{
            width: width ? `${width}px` : 'auto',
            ...positionStyles[position].dropdown,
          }}>
          <div
            className={cn(
              'border rounded-md bg-popover p-2 text-popover-foreground shadow-md '
            )}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
