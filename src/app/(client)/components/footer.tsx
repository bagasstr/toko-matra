'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const Footer = () => {
  const pathname = usePathname()
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/daftar')
  )
    return null

  return (
    <footer className='bg-gray-900 text-gray-200 pt-10 pb-20 mt-10'>
      <div className='max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8'>
        {/* Logo & Deskripsi */}
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <Link href='/' className='relative w-10 h-10'>
              <Image
                src='/assets/Logo.png'
                alt='Logo'
                width={40}
                height={40}
                className='w-full h-full object-contain'
                priority={false}
              />
            </Link>
            <span className='font-bold text-xl text-white'>TOKO MATRA</span>
          </div>
          <p className='text-sm text-gray-400 mb-2'>
            Toko bahan bangunan online, solusi lengkap kebutuhan konstruksi dan
            renovasi Anda.
          </p>
        </div>
        {/* Navigasi */}
        <div>
          <div className='font-semibold mb-2 text-white'>Navigasi</div>
          <ul className='space-y-1 text-sm'>
            <li>
              <Link href='/tentang-matrakosala' className='hover:underline'>
                Tentang
              </Link>
            </li>
            <li>
              <Link href='/produk' className='hover:underline'>
                Produk
              </Link>
            </li>
            <li>
              <Link href='/faq' className='hover:underline'>
                FAQ
              </Link>
            </li>
            <li>
              <Link href='/kontak' className='hover:underline'>
                Kontak
              </Link>
            </li>
          </ul>
        </div>
        {/* Kontak */}
        <div>
          <div className='font-semibold mb-2 text-white'>Kontak</div>
          <ul className='text-sm space-y-1'>
            <li>Jl. Contoh Alamat No. 123, Jakarta</li>
            <li>
              Email:{' '}
              <a href='mailto:info@tokomatra.com' className='hover:underline'>
                info@tokomatra.com
              </a>
            </li>
            <li>
              WhatsApp:{' '}
              <a
                href='https://wa.me/6281234567890'
                target='_blank'
                className='hover:underline'>
                0812-3456-7890
              </a>
            </li>
          </ul>
        </div>
        {/* Sosial Media */}
        <div>
          <div className='font-semibold mb-2 text-white'>Ikuti Kami</div>
          <div className='flex gap-3'>
            <a href='#' className='hover:text-primary'>
              Instagram
            </a>
            <a href='#' className='hover:text-primary'>
              Facebook
            </a>
            <a href='#' className='hover:text-primary'>
              YouTube
            </a>
          </div>
        </div>
      </div>
      <div className='mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-400'>
        <div className='mb-2 flex flex-wrap justify-center gap-4'>
          <Link href='/syarat-ketentuan' className='hover:underline'>
            Syarat & Ketentuan
          </Link>
          <span>|</span>
          <Link href='/kebijakan-privasi' className='hover:underline'>
            Kebijakan Privasi
          </Link>
        </div>
        &copy; {new Date().getFullYear()} TOKO MATRA. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
