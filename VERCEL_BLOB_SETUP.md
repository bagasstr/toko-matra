# Vercel Blob Storage Setup

## 1. Environment Variables

Tambahkan environment variable berikut di Vercel Dashboard atau file `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 2. Cara Mendapatkan Blob Token

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Buka tab **Storage**
4. Klik **Create Database** → **Blob**
5. Beri nama database (contoh: `tokomatra-images`)
6. Copy token yang diberikan ke environment variable `BLOB_READ_WRITE_TOKEN`

## 3. Perubahan yang Telah Dilakukan

### Upload Functions Updated:

- ✅ `uploadProductImages()` - menggunakan Vercel Blob
- ✅ `uploadBrandImage()` - menggunakan Vercel Blob
- ✅ `uploadProfileImage()` - menggunakan Vercel Blob
- ✅ `createBrand()` - menggunakan Vercel Blob untuk logo
- ✅ `updateBrand()` - menggunakan Vercel Blob untuk logo
- ✅ `saveImage()` - menggunakan Vercel Blob untuk profile

### File Structure di Blob:

```
blob-storage/
├── produk/
│   └── {uuid}.{ext}
├── merek/
│   └── {uuid}.{ext}
└── assets/
    └── avatar/
        └── {uuid}.{ext}
```

## 4. Keuntungan Vercel Blob

- ✅ **Global CDN**: Gambar served dari edge locations
- ✅ **Automatic Optimization**: Resize & format otomatis
- ✅ **Serverless Compatible**: Tidak perlu filesystem
- ✅ **Secure**: Public/private access control
- ✅ **Cost Effective**: Pay per use

## 5. Image URLs

Setelah upload, images akan memiliki URL format:

```
https://blob-name.vercel-storage.com/path/filename-hash.ext
```

## 6. Testing

Untuk testing local development:

1. Set `BLOB_READ_WRITE_TOKEN` di `.env.local`
2. Run `npm run dev`
3. Test upload functionality
4. Deploy ke Vercel untuk production testing

## 7. Migration Notes

Dengan Vercel Blob, kita tidak perlu lagi:

- ❌ `/api/images/` routes (images served langsung dari Blob CDN)
- ❌ Local filesystem storage
- ❌ Manual file management

Images sekarang:

- ✅ Tersimpan di Vercel Blob Storage
- ✅ Served via global CDN
- ✅ Otomatis optimized
- ✅ Secure & scalable

## 8. Troubleshooting

- **Error "Unauthorized"**: Check BLOB_READ_WRITE_TOKEN
- **Error "EROFS"**: Pastikan semua upload functions sudah menggunakan Blob
- **Slow uploads**: Normal untuk first time, akan di-cache selanjutnya
- **Images tidak muncul**: Check Next.js image domains configuration
