import type React from 'react'
interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardWrap({ children }: DashboardShellProps) {
  return <div className='flex flex-col gap-6'>{children}</div>
}
