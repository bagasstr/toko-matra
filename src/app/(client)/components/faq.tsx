'use client'

import React, { useState } from 'react'

const faqs = [
  {
    question: 'Bagaimana cara memesan produk?',
    answer:
      'Pilih produk yang diinginkan, klik tombol beli, lalu ikuti proses checkout hingga selesai.',
  },
  {
    question: 'Bagaimana cara pembayaran?',
    answer:
      'Kami menerima pembayaran melalui transfer bank, e-wallet, dan metode pembayaran online lainnya.',
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
        Kami menerima pembayaran melalui transfer bank, e-wallet, dan payment
        gateway (Virtual Account, QRIS, dll).
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
]

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className='py-8 mt-16 lg:mt-20'>
      <div className='container mx-auto px-4'>
        <h2 className='text-lg sm:text-xl lg:text-2xl text-center text-foreground/85 font-bold mb-8'>
          FAQ
        </h2>
        <div className='max-w-2xl mx-auto space-y-4'>
          {faqs.map((faq, idx) => (
            <div
              key={faq.question}
              className='border rounded-lg bg-white shadow-sm'>
              <button
                className='w-full text-left px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors'
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
                <div className='px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-gray-600 animate-fade-in'>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Faq
