import React from 'react'

const kategoriList = [
  { id: 1, name: 'Dinding', icon: '🧱' },
  { id: 2, name: 'Besi Beton & Wiremesh', icon: '🪓' },
  { id: 3, name: 'Semen', icon: '⚱️' },
  { id: 5, name: 'Lantai', icon: '🦶' },
  { id: 6, name: 'Atap & Rangka', icon: '🏠' },
  { id: 7, name: 'Plafon & Partisi', icon: '🪟' },
  { id: 8, name: 'Sistem Pemipaan', icon: '🚰' },
  { id: 9, name: 'Material Alam', icon: '🪨' },
  { id: 14, name: 'Aksesoris Dapur', icon: '🍳' },
  { id: 15, name: 'Sanitari & Aksesoris', icon: '🚽' },
  { id: 16, name: 'Aksesoris Kamar Mandi', icon: '🚿' },
]

const KategoriList = () => {
  return (
    <div className='p-4'>
      {kategoriList.map((kategori) => (
        <div
          key={kategori.id}
          className='flex items-center gap-4 py-3 px-2 bg-white hover:bg-blue-50 transition border-b last:border-b-0 cursor-pointer'>
          <span className='text-2xl'>{kategori.icon}</span>
          <span className='text-base font-medium text-gray-700'>
            {kategori.name}
          </span>
        </div>
      ))}
    </div>
  )
}

export default KategoriList
