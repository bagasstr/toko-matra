'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'

const AuthSection = () => {
  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow flex flex-col items-center container'>
      <div className='text-xl font-semibold text-gray-800 mb-2'>
        Selamat Datang di E-Commerce
      </div>
      <div className='text-gray-500 text-center mb-6'>
        Silakan login untuk melanjutkan, atau daftar jika belum punya akun.
      </div>
      <div className='flex flex-col gap-4 w-full'>
        <Suspense fallback={<>Loading...</>}>
          <Link href='/login' className='w-full'>
            <button className='w-full py-3 bg-blue-600 text-white rounded font-semibold text-base hover:bg-blue-700 transition'>
              Login
            </button>
          </Link>
        </Suspense>
        <Link href='/daftar' className='w-full'>
          <button className='w-full py-3 bg-gray-200 text-gray-700 rounded font-semibold text-base hover:bg-gray-300 transition'>
            Register
          </button>
        </Link>
      </div>
    </div>
  )
}

export default AuthSection
