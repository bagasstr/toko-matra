# Supabase Storage Setup

## Setup Supabase Project

1. Buat project baru di [Supabase](https://supabase.com/)
2. Dapatkan Project URL dan Anon Key dari Settings > API
3. Tambahkan environment variables ke file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Storage Bucket

1. Buka Supabase Dashboard
2. Navigasi ke Storage
3. Buat bucket baru dengan nama `images`
4. Set bucket policy untuk public access:

```sql
-- Option 1: Public bucket (Recommended untuk kemudahan)
-- Buat bucket 'images' dengan PUBLIC access
-- Di Dashboard Supabase: Storage > Create bucket > Public bucket = TRUE

-- Option 2: Jika menggunakan private bucket, gunakan policies berikut:
-- Enable RLS untuk bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca file (public access)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Policy untuk upload file (semua user bisa upload)
CREATE POLICY "Anyone can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- Policy untuk update file
CREATE POLICY "Anyone can update" ON storage.objects
  FOR UPDATE WITH CHECK (bucket_id = 'images');

-- Policy untuk delete file
CREATE POLICY "Anyone can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');
```

## Struktur Folder

File akan disimpan dengan struktur:

- `products/` - Gambar produk
- `brands/` - Logo brand
- `profiles/` - Avatar profile user

## Implementasi

### 1. Upload File

```typescript
import { uploadToSupabase } from '@/lib/supabase'

const { url, error } = await uploadToSupabase(
  file,
  'images',
  'products/filename.jpg'
)
```

### 2. Upload Base64

```typescript
import { uploadBase64ToSupabase } from '@/lib/supabase'

const { url, error } = await uploadBase64ToSupabase(
  base64Data,
  'images',
  'profiles/avatar.jpg'
)
```

### 3. Delete File

```typescript
import { deleteFromSupabase } from '@/lib/supabase'

const { success, error } = await deleteFromSupabase(
  'images',
  'products/filename.jpg'
)
```

## Migration dari Local Storage

Sistem mendukung backward compatibility:

- File lama tetap bisa diakses melalui API routes
- File baru akan otomatis menggunakan Supabase Storage
- Delete function dapat handle kedua jenis storage

## Troubleshooting

### Error: "new row violates row-level security policy"

Jika mendapat error RLS saat upload, ikuti langkah berikut:

#### Solusi 1: Gunakan Public Bucket (Recommended)

1. Buka Supabase Dashboard > Storage
2. Create bucket baru atau edit bucket 'images'
3. **Centang "Public bucket"**
4. Save

#### ⚠️ Jika bucket sudah PUBLIC tapi masih error:

### 🔧 Error "must be owner of table objects"

Jika mendapat error permission, gunakan **Solusi Tanpa SQL** berikut:

**Langkah 1: Reset Bucket (Recommended)**

1. Buka Supabase Dashboard > Storage
2. **Delete bucket 'images'** (jika ada)
3. **Buat bucket baru 'images'**
4. ✅ **Centang "Public bucket"**
5. ✅ **JANGAN set custom policies**
6. Save

**Langkah 2: Jika masih error, coba hapus policies manual**
Buka SQL Editor dan jalankan **satu per satu**:

```sql
-- Cek policies yang ada
SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- Hapus satu per satu (ganti NAMA_POLICY dengan nama yang muncul di atas)
DROP POLICY IF EXISTS "NAMA_POLICY" ON storage.objects;

-- Contoh:
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
```

**Langkah 3: Buat policy sederhana**

```sql
-- Buat policy universal untuk bucket images
CREATE POLICY "images_policy" ON storage.objects
FOR ALL TO public USING (bucket_id = 'images');
```

#### Solusi 2: Fix RLS Policies

1. Buka SQL Editor di Supabase Dashboard
2. Jalankan query berikut:

```sql
-- Hapus semua policies lama
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

-- Buat policies baru
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'images');
CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
```

#### Solusi 3: Disable RLS (Quick Fix)

```sql
-- Matikan RLS untuk bucket images (tidak recommended untuk production)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Testing Upload

Gunakan API route `/api/upload/test` untuk testing:

```bash
curl -X POST http://localhost:3000/api/upload/test \
  -F "file=@path/to/your/image.jpg" \
  -F "type=test"
```

## Keuntungan Supabase Storage

1. **Skalabilitas**: Tidak perlu khawatir storage space server
2. **CDN**: File dilayani melalui CDN global
3. **Backup**: Otomatis backup dan recovery
4. **Security**: Built-in access control dan policies
5. **Performance**: Optimized untuk web applications
