'use client'

import React, { useState } from 'react'

const faqs = [
  {
    question: 'Apakah semua produk ready stock?',
    answer: (
      <div>
        Tidak semua produk ready stock. Kami menggunakan sistem Supply on
        Demand, yang berarti produk bisa:
        <ul className='list-disc pl-5 mt-2'>
          <li>Ready stock di gudang kami (khusus area Pulau Jawa)</li>
          <li>Ready stock dari supplier (dikirim langsung)</li>
          <li>Indent/pre-order (produk akan diproduksi lebih dulu)</li>
        </ul>
        <p>
          Keterangan stok tersedia di halaman produk. Jika ragu, Anda akan
          dikonfirmasi kembali oleh tim kami melalui WhatsApp setelah pemesanan.
        </p>
      </div>
    ),
  },
  {
    question: 'Apakah saya bisa memilih kurir sendiri?',
    answer: (
      <div>
        Untuk pengiriman material bangunan yang berat dan besar, kurir akan
        ditentukan oleh sistem kami berdasarkan lokasi Anda dan jenis produk.
        Kami menggunakan:
        <ul className='list-disc pl-5 mt-2'>
          <li>Ekspedisi kargo (khusus Jabodetabek & sebagian Pulau Jawa)</li>
          <li>Pengiriman langsung dari supplier (terutama luar pulau)</li>
        </ul>
        <p>
          Keterangan stok tersedia di halaman produk. Jika ragu, Anda akan
          dikonfirmasi kembali oleh tim kami melalui WhatsApp setelah pemesanan.
        </p>
      </div>
    ),
  },
  {
    question: 'Bagaimana cara cek ongkir dan estimasi waktu kirim?',
    answer: (
      <div className='space-y-2'>
        <p>
          Estimasi ongkir dan waktu kirim ditampilkan otomatis di halaman
          checkout berdasarkan alamat dan berat produk. Estimasi ongkir dan
          waktu kirim ditampilkan otomatis di halaman checkout berdasarkan
          alamat dan berat produk.
        </p>
        <p>
          Untuk produk tertentu atau pengiriman ke luar Pulau Jawa, estimasi
          akan dikonfirmasi oleh tim kami via WhatsApp.
        </p>
      </div>
    ),
  },
  {
    question: 'Apa itu sistem Supply on Demand?',
    answer: (
      <div>
        Supply on Demand adalah sistem pemenuhan pesanan berdasarkan stok yang
        tersedia di gudang kami maupun supplier. Produk bisa berupa:
        <ul className='list-disc pl-5 mt-2'>
          <li>Ready stock di gudang kami (khusus area Pulau Jawa)</li>
          <li>Ready stock dari supplier (dikirim langsung)</li>
          <li>Indent/pre-order (produk akan diproduksi lebih dulu)</li>
        </ul>
      </div>
    ),
  },
  {
    question: 'Apakah pengiriman menjangkau seluruh Indonesia?',
    answer: (
      <div>
        Kami melayani pengiriman ke seluruh Indonesia. Namun, saat ini gudang
        kami hanya menjangkau Pulau Jawa. Untuk luar Pulau Jawa, pengiriman
        dilakukan langsung oleh supplier.
      </div>
    ),
  },
  {
    question: 'Bagaimana saya tahu produk ready stock atau indent?',
    answer: (
      <div>
        Keterangan stok tersedia di halaman produk. Jika ragu, Anda akan
        dikonfirmasi kembali oleh tim kami melalui WhatsApp setelah pemesanan.
      </div>
    ),
  },
  {
    question: 'Berapa lama waktu pengiriman?',
    answer: (
      <div>
        <ul className='list-disc pl-5'>
          <li>
            <b>Jabodetabek:</b> 1-2 hari kerja (ready stock)
          </li>
          <li>
            <b>Luar Jabodetabek (Pulau Jawa):</b> 2-5 hari kerja
          </li>
          <li>
            <b>Luar Pulau Jawa:</b> mengikuti estimasi supplier
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: 'Apa saja metode pembayaran yang tersedia?',
    answer: (
      <div>
        Kami menerima pembayaran melalui transfer bank, e-wallet, virtual
        Account, QRIS, dll.
      </div>
    ),
  },
  {
    question: 'Apakah bisa COD (Bayar di Tempat)?',
    answer: <div>Saat ini kami belum mendukung sistem pembayaran COD.</div>,
  },
  {
    question: 'Apakah produk bisa dikembalikan?',
    answer: (
      <div>
        Pengembalian hanya berlaku untuk produk yang rusak saat pengiriman atau
        tidak sesuai dengan pesanan. Laporan maksimal 2x24 jam setelah barang
        diterima.
      </div>
    ),
  },
  {
    question: 'Bagaimana cara memesan produk?',
    answer: (
      <div>
        Pilih produk yang diinginkan, klik tombol <b>Beli</b>, lalu ikuti proses
        checkout hingga selesai. Anda dapat menambah produk ke keranjang untuk
        belanja lebih dari satu produk sekaligus.
      </div>
    ),
  },
  {
    question: 'Apakah produk yang dijual original?',
    answer: (
      <div>
        Ya, semua produk yang kami jual adalah original dan bergaransi resmi
        dari distributor atau pabrik terkait.
      </div>
    ),
  },
  {
    question: 'Bagaimana cara mendapatkan penawaran harga grosir atau proyek?',
    answer: (
      <div>
        Untuk pembelian dalam jumlah besar atau kebutuhan proyek, silakan
        hubungi tim sales kami melalui WhatsApp atau email untuk mendapatkan
        penawaran khusus.
      </div>
    ),
  },
  {
    question: 'Bagaimana jika saya ingin konsultasi produk?',
    answer: (
      <div>
        Anda dapat menghubungi tim kami melalui WhatsApp atau formulir kontak
        untuk konsultasi produk, spesifikasi, atau kebutuhan proyek.
      </div>
    ),
  },
]

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className='py-10 min-h-screen bg-gray-50'>
      <div className='max-w-3xl mx-auto px-4'>
        <h1 className='text-2xl sm:text-3xl font-bold text-center mb-2'>
          FAQ (Pertanyaan yang Sering Diajukan)
        </h1>
        <p className='text-center text-gray-600 mb-8'>
          Temukan jawaban atas pertanyaan umum seputar belanja, pengiriman,
          pembayaran, dan layanan di TOKO MATRA. Jika pertanyaan Anda belum
          terjawab, silakan hubungi kami.
        </p>
        <div className='space-y-4'>
          {faqs.map((faq, idx) => (
            <div
              key={faq.question}
              className='border rounded-lg bg-white shadow-sm'>
              <button
                className='w-full text-left px-4 sm:px-6 py-3 sm:py-4 text-base font-semibold flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors'
                onClick={() => toggle(idx)}>
                <span>{faq.question}</span>
                <span
                  className={`transition-transform duration-200 ${
                    openIndex === idx ? 'rotate-90' : ''
                  }`}>
                  ▶
                </span>
              </button>
              {openIndex === idx && (
                <div className='px-4 sm:px-6 pb-4 sm:pb-6 text-gray-700 animate-fade-in'>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='mt-10 text-center text-sm text-gray-500'>
          Tidak menemukan jawaban? Hubungi kami di{' '}
          <a
            href='mailto:info@tokomatra.com'
            className='text-blue-600 underline'>
            info@tokomatra.com
          </a>{' '}
          atau{' '}
          <a
            href='https://wa.me/6281234567890'
            target='_blank'
            className='text-blue-600 underline'>
            WhatsApp
          </a>
          .
        </div>
      </div>
    </section>
  )
}

export default FaqPage
