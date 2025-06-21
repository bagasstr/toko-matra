# Setup Email Notifikasi Status Pesanan

## Konfigurasi Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```env
# Email Configuration
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

## Setup Gmail App Password

1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Pilih "Security" di menu kiri
3. Aktifkan "2-Step Verification" jika belum
4. Pilih "App passwords"
5. Generate password baru untuk aplikasi
6. Gunakan password tersebut untuk `EMAIL_PASSWORD`

## Template Email yang Tersedia

### 1. Pesanan Dikonfirmasi

- **Subject**: "Pesanan Dikonfirmasi - Sedang Diproses"
- **Warna**: Biru (#2196f3)
- **Konten**: Informasi pesanan sedang diproses

### 2. Pesanan Dikirim

- **Subject**: "Pesanan Dikirim - Dalam Perjalanan"
- **Warna**: Orange (#ff9800)
- **Konten**: Informasi pengiriman dengan tracking number

### 3. Pesanan Selesai

- **Subject**: "Pesanan Selesai - Terima Kasih!"
- **Warna**: Hijau (#4caf50)
- **Konten**: Konfirmasi pesanan selesai

### 4. Pesanan Dibatalkan

- **Subject**: "Pesanan Dibatalkan"
- **Warna**: Merah (#f44336)
- **Konten**: Informasi pembatalan dengan alasan

## Integrasi Sistem

### Dashboard Admin

Email otomatis dikirim saat admin mengubah status pesanan:

- CONFIRMED → Email konfirmasi
- SHIPPED → Email pengiriman
- DELIVERED → Email selesai
- CANCELLED → Email pembatalan

### API Midtrans

Email otomatis dikirim saat pembayaran berhasil:

- Payment SUCCESS → Email konfirmasi pesanan

### Notifikasi In-App

Email dikirim bersamaan dengan notifikasi in-app untuk memastikan pelanggan mendapat informasi lengkap.

## Monitoring dan Log

### Success Log

```
Order confirmed email sent for order: order_123
Order shipped email sent for order: order_123
Order delivered email sent for order: order_123
Order cancelled email sent for order: order_123
```

### Error Log

```
Failed to send order confirmed email: [error details]
Failed to send order shipped email: [error details]
```

## Troubleshooting

### Email Tidak Terkirim

1. Periksa konfigurasi Gmail App Password
2. Pastikan 2-Step Verification aktif
3. Cek log error di console
4. Verifikasi environment variables

### Email Terkirim Tapi Tidak Masuk Inbox

1. Periksa folder Spam
2. Pastikan domain email pengirim terpercaya
3. Cek konfigurasi SMTP

### Template Email Tidak Tampil Benar

1. Periksa HTML template di `sendmailerTransport.ts`
2. Test di berbagai email client
3. Pastikan CSS inline untuk kompatibilitas

## Testing

### Test Manual

1. Buat pesanan baru
2. Ubah status di dashboard admin
3. Periksa email yang diterima
4. Verifikasi template dan konten

### Test Otomatis

```bash
# Test email configuration
npm run test:email

# Test specific template
npm run test:email:confirmed
npm run test:email:shipped
npm run test:email:delivered
npm run test:email:cancelled
```

## Customization

### Mengubah Template

Edit file `src/lib/sendmailerTransport.ts`:

- Ubah HTML template
- Modifikasi warna dan styling
- Tambahkan informasi tambahan

### Menambah Status Baru

1. Buat template email baru
2. Tambahkan fungsi di `orderStatusNotification.ts`
3. Integrasikan ke `orderAction.ts`
4. Update dashboard admin

### Mengubah Konfigurasi SMTP

Edit `src/lib/sendmailerTransport.ts`:

```javascript
export const transport = nodemailer.createTransport({
  service: 'gmail', // atau service lain
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
})
```
