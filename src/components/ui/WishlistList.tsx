import React from 'react'
import Image from 'next/image'

const wishlist = [
  {
    id: 1,
    name: 'Semen Tiga Roda 50kg',
    price: 75000,
    image: '/assets/products/semen-tigaroda.png',
  },
  {
    id: 2,
    name: 'Bata Merah Press',
    price: 1200,
    image: '/assets/products/bata-merah.png',
  },
  {
    id: 3,
    name: 'Keramik Lantai 40x40',
    price: 65000,
    image: '/assets/products/keramik-lantai.png',
  },
]

const WishlistList = () => {
  return (
    <div className='p-4'>
      {wishlist.map((item) => (
        <div
          key={item.id}
          className='flex items-center gap-4 py-3 px-2 bg-white hover:bg-gray-50 transition border-b last:border-b-0'>
          <Image
            src={item.image}
            alt={item.name}
            width={56}
            height={56}
            className='rounded object-contain bg-gray-100'
          />
          <div className='flex-1'>
            <div className='font-medium text-gray-800 text-sm'>{item.name}</div>
            <div className='text-blue-600 font-semibold text-base'>
              Rp{item.price.toLocaleString('id-ID')}
            </div>
          </div>
          <button className='text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded transition'>
            &#10005;
          </button>
        </div>
      ))}
      {wishlist.length === 0 && (
        <div className='text-center text-gray-400 py-8'>
          Belum ada produk di wishlist
        </div>
      )}
    </div>
  )
}

export default WishlistList
