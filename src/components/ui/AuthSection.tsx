'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn, UserPlus, ArrowRight } from 'lucide-react'

const AuthSection = () => {
  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gray-50'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
          {/* Header with background */}
          <div className='bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center relative'>
            <div className='absolute top-0 left-0 w-full h-full opacity-10'>
              <svg
                className='w-full h-full'
                viewBox='0 0 100 100'
                preserveAspectRatio='none'>
                <path d='M0,0 L100,0 L100,100 L0,100 Z' fill='white' />
                <path d='M0,0 C40,40 60,40 100,0 V100 H0 Z' fill='white' />
              </svg>
            </div>
            <div className='relative z-10'>
              <div className='flex justify-center mb-4'>
                <Image
                  src='/assets/Logo_white.png'
                  alt='Logo'
                  width={160}
                  height={50}
                  className='h-auto'
                />
              </div>
              <h1 className='text-2xl font-bold mb-2'>Selamat Datang</h1>
              <p className='text-blue-100'>
                Silakan masuk untuk melanjutkan belanja
              </p>
            </div>
          </div>

          {/* Content */}
          <div className='p-6 md:p-8'>
            <div className='space-y-6'>
              <div className='flex flex-col gap-4'>
                <Suspense
                  fallback={
                    <div className='w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold text-center'>
                      Loading...
                    </div>
                  }>
                  <Link href='/login' className='w-full'>
                    <button className='w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-200 flex items-center justify-center group'>
                      <LogIn className='mr-2 h-5 w-5' />
                      Masuk
                      <ArrowRight className='ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform' />
                    </button>
                  </Link>
                </Suspense>

                <Link href='/daftar' className='w-full'>
                  <button className='w-full py-3.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group'>
                    <UserPlus className='mr-2 h-5 w-5 text-gray-600' />
                    Daftar Akun Baru
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 text-center border-t border-gray-100'>
            <p className='text-xs text-gray-500'>
              Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan serta
              Kebijakan Privasi kami
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthSection
