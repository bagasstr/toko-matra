import React from 'react'
import { Bell, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const notifications = [
  {
    id: 1,
    title: 'Pesanan Dikirim',
    message: 'Pesanan #INV123456 telah dikirim dan sedang dalam perjalanan.',
    time: '2 jam lalu',
    read: false,
  },
  {
    id: 2,
    title: 'Promo Spesial',
    message: 'Dapatkan diskon 10% untuk pembelian semen minggu ini!',
    time: '1 hari lalu',
    read: true,
  },
  {
    id: 3,
    title: 'Pesanan Selesai',
    message: 'Pesanan #INV123123 telah selesai. Terima kasih telah berbelanja!',
    time: '3 hari lalu',
    read: true,
  },
]

const page = () => {
  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6 flex items-center gap-2'>
        <Bell /> Notifikasi
      </h1>
      {notifications.length === 0 ? (
        <div className='text-gray-400 text-center py-10'>
          Tidak ada notifikasi.
        </div>
      ) : (
        <div className='space-y-4'>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 items-start p-4 rounded-xl border shadow-sm bg-white relative ${
                notif.read ? 'opacity-70' : 'bg-primary/5 border-primary/30'
              }`}>
              <div className='pt-1'>
                {notif.read ? (
                  <CheckCircle className='text-green-400' size={24} />
                ) : (
                  <Bell className='text-primary' size={24} />
                )}
              </div>
              <div className='flex-1'>
                <div className='font-semibold mb-1 text-base'>
                  {notif.title}
                </div>
                <div className='text-sm text-gray-600 mb-1'>
                  {notif.message}
                </div>
                <div className='text-xs text-gray-400'>{notif.time}</div>
              </div>
              {!notif.read && (
                <span className='absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse' />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default page
