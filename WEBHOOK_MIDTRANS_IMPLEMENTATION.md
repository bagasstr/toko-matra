# Implementasi Webhook Midtrans

## Overview

Sistem pembayaran telah diubah untuk menggunakan webhook Midtrans sebagai metode utama untuk update status pembayaran. Hal ini mengurangi ketergantungan pada pengecekan manual status dan meningkatkan reliability.

## Cara Kerja Webhook

### 1. Flow Pembayaran

1. User melakukan checkout dan pembayaran dibuat via Midtrans API
2. User melakukan pembayaran di sistem bank/e-wallet
3. **Midtrans secara otomatis mengirim webhook notification** ke endpoint `/api/midtrans/notification`
4. Webhook handler memperbarui status pembayaran dan order di database
5. Cache halaman terkait di-revalidate otomatis
6. User melihat status terbaru tanpa refresh manual

### 2. Webhook Endpoint: `/api/midtrans/notification`

- **Method**: POST
- **URL**: `{BASE_URL}/api/midtrans/notification`
- **Function**: Menerima notification dari Midtrans ketika status transaksi berubah

#### Proses Webhook:

1. **Validasi signature** untuk memastikan request berasal dari Midtrans
2. **Update status** payment dan order berdasarkan notification
3. **Revalidate cache** untuk halaman terkait:
   - `/orders/{orderId}`
   - `/orders`
   - `/dashboard/pesanan`
   - `/dashboard/pesanan/detail-pesanan/{orderId}`
4. **Kirim notifikasi** ke user jika pembayaran sukses

### 3. Auto-Refresh di Order Detail Page

- **Interval**: 10 detik untuk status PENDING
- **Stop condition**: Status SUCCESS, FAILED, atau CANCELLED
- **Manual refresh**: Tombol "Refresh Data" hanya refresh dari database

## Keuntungan Sistem Webhook

### ✅ Pros:

1. **Real-time updates** - Status update langsung dari Midtrans
2. **Reduced API calls** - Tidak perlu polling status secara manual
3. **Better reliability** - Webhook lebih reliable daripada polling
4. **Automatic retry** - Midtrans akan retry webhook jika gagal
5. **Lower latency** - User mendapat update lebih cepat

### ❌ Limitations:

1. **Network dependency** - Webhook bisa gagal jika ada masalah network
2. **Development testing** - Perlu ngrok/tunnel untuk testing lokal
3. **Fallback mechanism** - Auto-refresh masih diperlukan sebagai backup

## Konfigurasi Environment

```env
# Base URL untuk webhook dan callbacks
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Midtrans credentials
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
```

## Testing

### Development (Local):

1. Use ngrok untuk expose localhost:
   ```bash
   ngrok http 3000
   ```
2. Set `NEXT_PUBLIC_BASE_URL` ke ngrok URL
3. Update webhook URL di Midtrans dashboard

### Production:

1. Set `NEXT_PUBLIC_BASE_URL` ke production domain
2. Ensure `/api/midtrans/notification` endpoint accessible

## Monitoring

### Log Webhook Activity:

- Check console logs untuk webhook notifications
- Monitor database untuk status updates
- Verify cache revalidation

### Error Handling:

- Invalid signature → 400 Bad Request
- Payment not found → 404 Not Found
- Database errors → 500 Internal Server Error
- Temporary Midtrans errors → Retry mechanism

## Files Modified

1. **`/api/midtrans/notification/route.ts`**

   - Enhanced webhook handler
   - Added cache revalidation
   - Improved error handling

2. **`/actions/midtransAction.ts`**

   - Added webhook notification URL to transaction details
   - Enhanced retry logic for API calls
   - Better error messaging

3. **`/orders/[id]/page.tsx`**

   - Simplified to rely on webhook updates
   - Reduced manual refresh frequency
   - Added auto-update messaging

4. **`/lib/midtransClient.ts`**
   - Added retry logic for Midtrans API calls
   - Better error categorization
   - Enhanced timeout handling

## User Experience

### What Users See:

- "Status update otomatis" message on pending payments
- "Status akan terupdate otomatis setelah pembayaran" info text
- Manual "Refresh Data" button as fallback
- Auto-refresh every 10 seconds for pending status

### Performance Impact:

- ✅ Reduced API calls to Midtrans
- ✅ Faster status updates via webhook
- ✅ Better cache management
- ✅ Lower server load from polling

## Troubleshooting

### Webhook Not Working:

1. Check webhook URL di Midtrans dashboard
2. Verify NEXT_PUBLIC_BASE_URL environment variable
3. Test webhook endpoint manually
4. Check server logs for errors

### Status Not Updating:

1. Verify webhook received (check console logs)
2. Check database updates
3. Verify cache revalidation
4. Test manual refresh button

### Development Issues:

1. Use ngrok untuk local testing
2. Check webhook payload in Midtrans simulator
3. Monitor network requests
4. Verify environment variables
