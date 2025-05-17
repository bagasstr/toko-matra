import React from 'react'
import { Truck, ShieldCheck, Tag, Headphones } from 'lucide-react'

const benefits = [
  {
    icon: <Truck size={32} className='text-primary' />,
    title: 'Pengiriman Cepat',
    desc: 'Pesanan Anda dikirim dengan cepat dan aman ke seluruh Indonesia.',
  },
  {
    icon: <ShieldCheck size={32} className='text-primary' />,
    title: 'Produk Terjamin',
    desc: 'Hanya produk original & bergaransi resmi yang kami jual.',
  },
  {
    icon: <Tag size={32} className='text-primary' />,
    title: 'Harga Bersaing',
    desc: 'Dapatkan harga terbaik dan promo menarik setiap hari.',
  },
  {
    icon: <Headphones size={32} className='text-primary' />,
    title: 'CS Ramah & Siaga',
    desc: 'Customer service siap membantu Anda setiap saat.',
  },
]

const Benefit = () => {
  return (
    <section className='py-8 mt-16 lg:mt-20'>
      <div className='container mx-auto px-4'>
        <h2 className='text-lg sm:text-xl lg:text-2xl text-center text-foreground/85 font-bold mb-8'>
          Keunggulan Belanja di Sini
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto'>
          {benefits.map((item) => (
            <div
              key={item.title}
              className='flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-sm h-full'>
              <div className='mb-4'>{item.icon}</div>
              <div className='font-semibold mb-2 text-sm sm:text-base'>
                {item.title}
              </div>
              <div className='text-xs sm:text-sm text-gray-500'>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefit
