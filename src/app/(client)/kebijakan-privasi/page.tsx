'use client'

import React from 'react'

export default function KebijakanPrivasiPage() {
  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-4'>Kebijakan Privasi</h1>
      <p className='mb-4 text-gray-700'>
        Kami berkomitmen untuk melindungi privasi dan data pribadi Anda. Berikut
        adalah penjelasan mengenai data yang kami kumpulkan dan bagaimana kami
        menggunakannya:
      </p>
      <ul className='list-disc pl-5 space-y-2 text-gray-700'>
        <li>
          <b>Data yang Dikumpulkan:</b> Nama, alamat, email, nomor telepon, dan
          data transaksi.
        </li>
        <li>
          <b>Penggunaan Data:</b> Data digunakan untuk keperluan transaksi,
          pengiriman, dan komunikasi terkait layanan.
        </li>
        <li>
          <b>Keamanan Data:</b> Kami menjaga keamanan data Anda dan tidak
          membagikan data kepada pihak ketiga tanpa izin.
        </li>
        <li>
          <b>Cookie:</b> Website ini menggunakan cookie untuk meningkatkan
          pengalaman pengguna.
        </li>
        <li>
          <b>Perubahan Kebijakan:</b> Kami dapat memperbarui kebijakan privasi
          ini sewaktu-waktu. Perubahan akan diinformasikan melalui website.
        </li>
      </ul>
      <p className='mt-6 text-gray-500 text-sm'>
        Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan
        penggunaan data sesuai kebijakan privasi ini.
      </p>
    </div>
  )
}
