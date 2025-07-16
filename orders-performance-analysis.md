# Analisis Performa Halaman Orders/[id] - Laporan dan Rekomendasi

## 🔍 Ringkasan Masalah

Halaman navigasi ke `orders/[id]` mengalami kelambatan yang dapat disebabkan oleh beberapa faktor teknis yang telah diidentifikasi melalui analisis kode.

## 📊 Temuan Utama

### 1. **Database Query Performance Issues**

#### Missing Database Indexes
- ❌ **Tidak ada index pada kolom `orderId` di tabel Payment**
- ❌ **Tidak ada index pada kolom `userId` di tabel Order**
- ❌ **Query melakukan filter pada multiple relations tanpa index yang optimal**

#### Query Complexity
```typescript
// Query di getPaymentByOrderId melakukan:
// 1. Join Payment -> Order
// 2. Join Order -> OrderItem -> Product
// 3. Join Order -> Address
// 4. Filter berdasarkan userId (tanpa index)
```

### 2. **Client-Side Performance Issues**

#### Aggressive Polling
```typescript
// Polling setiap 10 detik untuk semua status
refetchInterval: (query) => {
  // Problem: Tetap polling meskipun sudah SUCCESS
  return 10000 // 10 seconds - terlalu agresif
}
```

#### Multiple Re-renders
- Komponen menggunakan multiple `useMemo` hooks
- Re-calculation berulang untuk data yang sama
- State management yang tidak optimal

### 3. **Network & Caching Issues**

#### Suboptimal Caching Strategy
```typescript
staleTime: 30000, // 30 seconds - terlalu pendek
gcTime: 5 * 60 * 1000, // 5 minutes - bisa ditingkatkan
```

#### Force Dynamic Rendering
```typescript
export const dynamic = 'force-dynamic' // Mencegah static optimization
```

## 🚀 Rekomendasi Optimisasi

### 1. **Database Optimization (HIGH PRIORITY)**

#### Tambahkan Index yang Missing
```prisma
model Payment {
  // ... existing fields
  @@index([orderId])
  @@index([orderId, status])
  @@map("payments")
}

model Order {
  // ... existing fields
  @@index([userId])
  @@index([userId, status])
  @@index([id, userId]) // Composite index untuk query utama
  @@map("orders")
}
```

#### Optimisasi Query dengan Select Fields
```typescript
// Batasi field yang di-select untuk mengurangi data transfer
select: {
  id: true,
  status: true,
  amount: true,
  // Hanya field yang benar-benar dibutuhkan
}
```

### 2. **Caching Strategy Improvement (HIGH PRIORITY)**

#### Tingkatkan Cache Duration
```typescript
{
  staleTime: 2 * 60 * 1000, // 2 menit untuk completed orders
  gcTime: 15 * 60 * 1000, // 15 menit cache
  refetchInterval: (query) => {
    const data = query.state.data
    if (data?.payment?.status === 'SUCCESS') {
      return false // Stop polling untuk order yang sudah selesai
    }
    return 30000 // 30 detik, bukan 10 detik
  }
}
```

#### Implementasi Conditional Caching
```typescript
// Cache lebih lama untuk order yang sudah complete
const getCacheConfig = (orderStatus: string) => {
  if (['SUCCESS', 'FAILED', 'CANCELLED'].includes(orderStatus)) {
    return {
      staleTime: 10 * 60 * 1000, // 10 menit
      refetchInterval: false
    }
  }
  return {
    staleTime: 30 * 1000, // 30 detik
    refetchInterval: 30000
  }
}
```

### 3. **Component Optimization (MEDIUM PRIORITY)**

#### Implementasi React.memo untuk Komponen Statis
```typescript
export const OrderItems = React.memo(({ items }: { items: OrderItem[] }) => {
  // Component yang tidak perlu re-render sering
})

export const ShippingAddress = React.memo(({ address }: { address: Address }) => {
  // Address data jarang berubah
})
```

#### Lazy Loading untuk Komponen Berat
```typescript
const PaymentInfo = dynamic(() => import('./PaymentInfo'), {
  loading: () => <PaymentInfoSkeleton />
})
```

### 4. **Network Optimization (MEDIUM PRIORITY)**

#### Implement Request Deduplication
```typescript
// Cegah multiple request bersamaan
const { data, isLoading } = useQuery({
  queryKey: ['orderDetails', orderId],
  // ... other config
  refetchOnMount: false, // Jika data masih fresh
  refetchOnWindowFocus: false // Kurangi unnecessary refetch
})
```

#### Add Response Compression
```typescript
// Di next.config.ts
experimental: {
  optimizePackageImports: ['@/components/ui'],
  serverComponentsExternalPackages: ['prisma']
}
```

### 5. **Code Splitting & Bundle Optimization (LOW PRIORITY)**

#### Dynamic Imports untuk Route
```typescript
// Implementasi di layout atau router
const OrderDetailPage = dynamic(() => import('./OrderDetailPage'), {
  loading: () => <OrderDetailSkeleton />
})
```

## 📈 Expected Performance Improvements

| Optimisasi | Estimated Speed Improvement |
|------------|----------------------------|
| Database Indexes | 60-80% faster queries |
| Caching Strategy | 40-60% faster loading |
| Component Memoization | 20-30% fewer re-renders |
| Request Optimization | 30-50% network efficiency |

## 🛠 Implementation Priority

### Phase 1 (Critical - Week 1)
1. ✅ Tambahkan database indexes
2. ✅ Optimisasi caching strategy
3. ✅ Perbaiki polling logic

### Phase 2 (Important - Week 2)
1. ✅ Component memoization
2. ✅ Request deduplication
3. ✅ Bundle optimization

### Phase 3 (Enhancement - Week 3)
1. ✅ Lazy loading implementation
2. ✅ Performance monitoring
3. ✅ Progressive loading strategies

## 🔧 Migration Script

```sql
-- Tambahkan indexes yang missing
CREATE INDEX IF NOT EXISTS "payments_orderId_idx" ON "payments"("orderId");
CREATE INDEX IF NOT EXISTS "payments_orderId_status_idx" ON "payments"("orderId", "status");
CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "orders_userId_status_idx" ON "orders"("userId", "status");
CREATE INDEX IF NOT EXISTS "orders_id_userId_idx" ON "orders"("id", "userId");
```

## 📊 Monitoring & Metrics

### Key Performance Indicators
- **Page Load Time**: Target < 2 seconds
- **Database Query Time**: Target < 100ms
- **Cache Hit Rate**: Target > 80%
- **Bundle Size**: Target < 500KB initial load

### Tools Rekomendasi
- **Database**: Prisma Studio untuk query analysis
- **Frontend**: Next.js built-in performance metrics
- **Monitoring**: Vercel Analytics atau similar

## 🎯 Kesimpulan

Masalah performa pada `orders/[id]` terutama disebabkan oleh:
1. **Missing database indexes** (impact terbesar)
2. **Aggressive polling strategy** 
3. **Suboptimal caching configuration**

Dengan implementasi rekomendasi di atas, diperkirakan akan ada peningkatan performa **70-85%** pada loading time halaman orders detail.