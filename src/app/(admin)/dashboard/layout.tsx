import { useEffect } from 'react'
import { useAuthStore } from '@/hooks/zustandStore'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserNav } from './components/User-nav'
import DashboardNav from './components/Dashboard-nav'
import { cn } from '@/lib/utils'
import { validateSession } from '@/app/actions/session'

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await validateSession()
  return (
    <SidebarProvider className={cn('')}>
      <DashboardNav />
      <main className={cn('w-full')}>
        <header className={cn('p-4 flex items-center justify-between')}>
          <SidebarTrigger />
          <UserNav session={session} />
        </header>
        <main className={cn('px-4')}>{children}</main>
      </main>
    </SidebarProvider>
  )
}
