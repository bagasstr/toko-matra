This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# E-commerce Building Materials

Aplikasi e-commerce untuk bahan bangunan dengan fitur lengkap termasuk manajemen produk, keranjang belanja, pembayaran, dan notifikasi.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Fitur Utama

### 🛒 E-commerce

- Katalog produk dengan kategori dan brand
- Keranjang belanja
- Checkout dan pembayaran
- Manajemen pesanan
- Sistem notifikasi

### 📧 Notifikasi Email Status Pesanan

Sistem ini mengirimkan notifikasi email otomatis ke pelanggan ketika status pesanan berubah:

#### Status Pesanan yang Mengirim Email:

1. **Pesanan Dikonfirmasi** - Ketika pesanan dikonfirmasi dan sedang diproses
2. **Pesanan Dikirim** - Ketika pesanan dikirim dengan informasi tracking
3. **Pesanan Selesai** - Ketika pesanan berhasil diterima
4. **Pesanan Dibatalkan** - Ketika pesanan dibatalkan dengan alasan

#### Template Email:

- **Design Responsif** - Email yang responsif untuk desktop dan mobile
- **Informasi Lengkap** - Detail pesanan, item, dan status
- **Call-to-Action** - Link untuk melihat detail pesanan
- **Branding Konsisten** - Menggunakan brand Matrakosala

#### Integrasi:

- **Dashboard Admin** - Email dikirim saat admin mengubah status
- **API Midtrans** - Email dikirim saat pembayaran berhasil
- **Sistem Notifikasi** - Terintegrasi dengan notifikasi in-app

### 🔧 Konfigurasi Email

Pastikan environment variables berikut sudah diset:

```env
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### 📱 Notifikasi In-App

- Notifikasi real-time untuk status pesanan
- Mark as read functionality
- Notification center untuk user

## Teknologi

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Payment**: Midtrans
- **Email**: Nodemailer dengan Gmail SMTP
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS, shadcn/ui

## Instalasi

1. Clone repository
2. Install dependencies: `npm install`
3. Setup database dan environment variables
4. Run migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Struktur Email Notifikasi

### File-file Utama:

- `src/lib/sendmailerTransport.ts` - Template email dan fungsi pengiriman
- `src/app/actions/orderStatusNotification.ts` - Logic notifikasi status pesanan
- `src/app/actions/orderAction.ts` - Integrasi dengan update status pesanan
- `src/app/api/midtrans/notification/route.ts` - Integrasi dengan webhook pembayaran

### Template Email:

Setiap status memiliki template email yang berbeda dengan:

- Header yang sesuai dengan status
- Warna yang berbeda untuk setiap status
- Informasi detail pesanan
- Link ke halaman detail pesanan
- Footer dengan branding Matrakosala

## Monitoring

Sistem mencatat log untuk setiap pengiriman email:

- Success: `Order [status] email sent successfully`
- Error: `Failed to send order [status] email: [error]`

Email notification tidak akan mengganggu operasi utama jika gagal dikirim.
