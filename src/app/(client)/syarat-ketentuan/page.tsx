'use client'

import React from 'react'

export default function SyaratKetentuanPage() {
  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-4'>Syarat dan Ketentuan</h1>
      <ol className='list-decimal pl-5 space-y-2 text-gray-700'>
        <li>
          <b>Pendaftaran Akun:</b> Pengguna wajib memberikan data yang benar dan
          lengkap saat mendaftar.
        </li>
        <li>
          <b>Transaksi:</b> Semua transaksi yang dilakukan melalui website ini
          dianggap sah dan mengikat.
        </li>
        <li>
          <b>Pembayaran:</b> Pembayaran dilakukan melalui metode yang tersedia.
          Pesanan akan diproses setelah pembayaran terverifikasi.
        </li>
        <li>
          <b>Pengiriman:</b> Pengiriman dilakukan sesuai alamat yang diberikan.
          Pastikan alamat dan nomor telepon benar.
        </li>
        <li>
          <b>Pengembalian Barang:</b> Pengembalian hanya dapat dilakukan jika
          barang rusak/cacat dan sesuai kebijakan pengembalian kami.
        </li>
        <li>
          <b>Perubahan Syarat:</b> Kami berhak mengubah syarat dan ketentuan ini
          sewaktu-waktu tanpa pemberitahuan sebelumnya.
        </li>
      </ol>
      <p className='mt-6 text-gray-500 text-sm'>
        Dengan menggunakan layanan kami, Anda dianggap telah membaca, memahami,
        dan menyetujui seluruh syarat dan ketentuan yang berlaku.
      </p>
    </div>
  )
}
