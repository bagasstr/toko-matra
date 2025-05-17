'use client'

import React, { useState } from 'react'

const faqs = [
  {
    question: 'Bagaimana cara memesan produk?',
    answer:
      'Pilih produk yang diinginkan, klik tombol beli, lalu ikuti proses checkout hingga selesai.',
  },
  {
    question: 'Apakah produk yang dijual original?',
    answer:
      'Ya, semua produk yang kami jual adalah original dan bergaransi resmi.',
  },
  {
    question: 'Bagaimana cara pembayaran?',
    answer:
      'Kami menerima pembayaran melalui transfer bank, e-wallet, dan metode pembayaran online lainnya.',
  },
  {
    question: 'Berapa lama pengiriman barang?',
    answer:
      'Pengiriman biasanya memakan waktu 1-3 hari kerja untuk area Jabodetabek dan 2-7 hari kerja untuk luar kota.',
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
