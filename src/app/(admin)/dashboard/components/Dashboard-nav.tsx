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

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

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

              {/* Products Group */}
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

              {/* Orders Group */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  asChild
                  isActive={pathname === '/pesanan'}>
                  <Link href='/dashboard/pesanan'>
                    <ShoppingCart className='h-4 w-4' />
                    <span>Pesanan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Users Group */}
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
                    <Link
                      href='/dashboard/pelanggan'
                      className='block text-sm hover:text-primary'>
                      Pelanggan
                    </Link>
                    <Link
                      href='/dashboard/admin'
                      className='block text-sm hover:text-primary'>
                      Admin
                    </Link>
                  </div>
                )}
              </SidebarMenuItem>
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
              </SidebarMenuItem>
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
            </SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupContent>
            <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant={'default'}
                  onClick={() => toggleGroup('settings')}>
                  <Settings className='h-4 w-4' />
                  <span>Pengaturan</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 ml-auto transition-transform',
                      openGroups.settings ? 'rotate-180' : ''
                    )}
                  />
                </SidebarMenuButton>
                {openGroups.settings && (
                  <div className='pl-8 mt-2 space-y-2'>
                    <Link
                      href='/dashboard/pengaturan'
                      className='block text-sm hover:text-primary'>
                      Umum
                    </Link>
                    <Link
                      href='/dashboard/pengaturan/profil'
                      className='block text-sm hover:text-primary'>
                      Profil
                    </Link>
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
