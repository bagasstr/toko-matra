import React from 'react'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'

const MaterialsOffer = () => {
  return (
    <section className='py-8'>
      <div className='max-w-xl mx-auto bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center text-center'>
        <h3 className='text-lg font-bold mb-2 text-primary'>
          Ingin Menawarkan Material di Toko Kami?
        </h3>
        <p className='text-gray-700 mb-4 text-sm'>
          Jika Anda adalah supplier atau distributor material bangunan dan ingin
          produk Anda tampil di toko kami, silakan hubungi tim kami untuk kerja
          sama penawaran terbaik.
        </p>
        <Link
          href='https://wa.me/6281234567890'
          target='_blank'
          className='inline-block px-5 py-2 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition'>
          Hubungi Kami
        </Link>
      </div>
    </section>
  )
}

export default MaterialsOffer
