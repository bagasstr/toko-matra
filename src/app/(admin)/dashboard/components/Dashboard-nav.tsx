'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  Building2,
  Home,
  Package,
  Settings,
  ShoppingCart,
  User,
  Users,
  Warehouse,
  ChevronDown,
  Truck,
  Badge,
  CircleSmall,
  UserCog,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const DashboardNav = () => {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    products: false,
    users: false,
    settings: false,
  })
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then((res) => res.json()),
  })

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const fetchDashboardStats = async () => {
    const res = await fetch('/api/dashboard-stats')
    if (!res.ok) throw new Error('Failed to fetch stats')
    return res.json()
  }

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: Infinity,
  })

  return (
    <div className=''>
      <Sidebar variant='floating'>
        <SidebarHeader>
          <div className='flex items-center gap-2 px-4 py-2'>
            <Image src={'/assets/Logo.png'} alt='logo' width={35} height={35} />
            <span className='font-bold text-xl'>Toko Matra</span>
          </div>
        </SidebarHeader>
        <SidebarContent className={cn('space-y-4 mt-4')}>
          <SidebarGroupContent>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  asChild
                  isActive={pathname === '/dashboard'}>
                  <Link href='/dashboard'>
                    <Home className='h-4 w-4' />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Pesanan */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  asChild
                  isActive={pathname === '/dashboard/pesanan'}>
                  <Link
                    href='/dashboard/pesanan'
                    className={cn(
                      'flex justify-between items-center gap-2 w-full'
                    )}>
                    <div className='flex items-center gap-2'>
                      <ShoppingCart className='h-4 w-4' />
                      <span>Pesanan</span>
                    </div>
                    {stats?.data?.newOrders >= 1 && (
                      <div
                        className={cn(
                          'h-2 w-2 mr-4 bg-primary rounded-full animate-pulse',
                          pathname === '/dashboard/pesanan' && 'bg-secondary'
                        )}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Surat Jalan
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  asChild
                  isActive={pathname === '/dashboard/surat-jalan'}>
                  <Link href='/dashboard/surat-jalan'>
                    <Truck className='h-4 w-4' />
                    <span>Surat Jalan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}

              {/* Produk Group */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  onClick={() => toggleGroup('products')}>
                  <Package className='h-4 w-4' />
                  <span>Produk</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 ml-auto transition-transform',
                      openGroups.products ? 'rotate-180' : ''
                    )}
                  />
                </SidebarMenuButton>
                {openGroups.products && (
                  <div className='pl-8 mt-2 space-y-2'>
                    <SidebarMenuButton
                      variant={'default'}
                      isActive={pathname === '/dashboard/produk'}
                      asChild>
                      <Link
                        href='/dashboard/produk'
                        className='block text-sm hover:text-primary'>
                        Daftar Produk
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      variant={'default'}
                      isActive={pathname === '/dashboard/produk/kategori'}
                      asChild>
                      <Link
                        href='/dashboard/produk/kategori'
                        className='block text-sm hover:text-primary'>
                        Kategori
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      variant={'default'}
                      isActive={pathname === '/dashboard/produk/merek'}
                      asChild>
                      <Link
                        href='/dashboard/produk/merek'
                        className='block text-sm hover:text-primary'>
                        Merek
                      </Link>
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>

              {/* Pelanggan */}

              {/* Statistik */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  asChild
                  isActive={pathname === '/dashboard/statistik'}>
                  <Link href='/dashboard/statistik'>
                    <BarChart3 className='h-4 w-4' />
                    <span>Statistik</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Pengguna Group */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  onClick={() => toggleGroup('users')}>
                  <Users className='h-4 w-4' />
                  <span>Pengguna</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 ml-auto transition-transform',
                      openGroups.users ? 'rotate-180' : ''
                    )}
                  />
                </SidebarMenuButton>
                {openGroups.users && (
                  <div className='pl-8 mt-2 space-y-2'>
                    {user?.role === 'SUPER_ADMIN' && (
                      <SidebarMenuButton
                        variant={'default'}
                        asChild
                        isActive={pathname === '/dashboard/admin'}>
                        <Link
                          href='/dashboard/admin'
                          className='block text-sm hover:text-primary'>
                          <UserCog className='h-4 w-4' />
                          <span>Admin</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    <SidebarMenuButton
                      variant={'default'}
                      asChild
                      isActive={pathname === '/dashboard/pelanggan'}>
                      <Link href='/dashboard/pelanggan'>
                        <User className='h-4 w-4' />
                        <span>Pelanggan</span>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
export default DashboardNav
