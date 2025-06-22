# 🚀 Performance Optimization Guide

## 🐌 Masalah: Website Lemot Setelah Vercel Blob

### **Penyebab Utama:**

- Image loading dari external Blob storage tanpa optimasi
- No caching strategy
- Multiple images loaded bersamaan
- Next.js Image component not optimized

### **Solusi yang Sudah Diimplementasikan:**

## ✅ **1. Next.js Image Optimization**

```typescript
// next.config.ts
images: {
  unoptimized: false, // Enable Next.js optimization
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.vercel-storage.com',
    },
  ],
}
```

## ✅ **2. OptimizedImage Component**

```typescript
// src/components/OptimizedImage.tsx
<OptimizedImage
  src={blobUrl}
  alt='Product image'
  width={300}
  height={300}
  priority={false} // Only true for above-fold images
  quality={75} // Balanced quality vs size
  sizes='(max-width: 768px) 100vw, 50vw'
/>
```

## ✅ **3. Image Preloading Hooks**

```typescript
// Preload single image
const { isLoaded, hasError } = useImagePreload(imageUrl, { quality: 75 })

// Preload multiple images
const { loadedImages, loadProgress } = useImageBatch(imageUrls, { quality: 75 })
```

## ✅ **4. Blob Cache Configuration**

```typescript
// Upload dengan 1 year cache
const blob = await put(filename, file, {
  access: 'public',
  cacheControlMaxAge: 31536000, // 1 year
})
```

## 📈 **Performance Tips:**

### **Replace Regular Images:**

```typescript
// ❌ Before (slow)
<img src={blobUrl} alt="Product" />

// ✅ After (fast)
<OptimizedImage
  src={blobUrl}
  alt="Product"
  width={300}
  height={300}
  priority={isAboveFold}
  quality={75}
/>
```

### **Image Lazy Loading:**

```typescript
// Priority untuk images di atas fold
<OptimizedImage priority={true} /> // Hero images

// Lazy loading untuk images di bawah fold
<OptimizedImage priority={false} /> // Product grid
```

### **Responsive Images:**

```typescript
// Different sizes untuk different screens
sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
```

## 🎯 **Immediate Actions:**

### **1. Update Existing Image Usage:**

Find and replace semua usage:

```bash
# Search untuk img tags yang menggunakan Blob URLs
grep -r "vercel-storage.com" src/
```

### **2. Add Loading States:**

```typescript
{
  isLoading && (
    <div className='animate-pulse bg-gray-200 rounded'>Loading...</div>
  )
}
```

### **3. Implement Progressive Loading:**

```typescript
// Load thumbnail first, then full image
const thumbnailUrl = `${blobUrl}?w=50&q=30`
const fullUrl = `${blobUrl}?w=800&q=75`
```

## 🔧 **Advanced Optimizations:**

### **Virtual Scrolling (untuk product lists):**

```bash
npm install @tanstack/react-virtual
```

### **Image Compression on Upload:**

```typescript
// Compress sebelum upload ke Blob
import imageCompression from 'browser-image-compression'

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
})
```

### **Service Worker Caching:**

```typescript
// Cache Blob images di browser
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('vercel-storage.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})
```

## 📊 **Performance Monitoring:**

### **Core Web Vitals:**

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Tools untuk Testing:**

- Google PageSpeed Insights
- Chrome DevTools Lighthouse
- Vercel Analytics

## 🚨 **Quick Fixes untuk Emergency:**

1. **Reduce Image Quality Temporarily:**

   ```typescript
   quality={50} // From 75 to 50
   ```

2. **Add Aggressive Caching:**

   ```typescript
   <Image ... loading="lazy" />
   ```

3. **Limit Concurrent Uploads:**

   ```typescript
   // Upload 1 by 1 instead of parallel
   for (const file of files) {
     await uploadSingle(file)
   }
   ```

4. **Use Thumbnail Views:**
   ```typescript
   // Show thumbnails, full image on click
   const thumbnailUrl = `${url}?w=150&q=60`
   ```
