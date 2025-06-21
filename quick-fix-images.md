# Quick Fix - Image to OptimizedImage Replacement

## ✅ **Files Already Fixed:**

1. ✅ `src/components/ProductDetail.tsx` - Updated
2. ✅ `src/app/(client)/components/FeaturedProducts.tsx` - Updated
3. ✅ `src/app/(client)/wishlist/wishlistComp.tsx` - Updated
4. ✅ `src/app/(client)/components/footer.tsx` - Updated

## 🎯 **Pattern for Manual Replacement:**

### **Import Replacement:**

```typescript
// ❌ Before
import Image from 'next/image'

// ✅ After
import OptimizedImage from '@/components/OptimizedImage'
```

### **Usage Replacement:**

#### **Pattern 1: Image with fill**

```typescript
// ❌ Before
<Image
  src={imageUrl}
  alt="Description"
  fill
  className="object-cover"
  sizes="100vw"
/>

// ✅ After
<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={400}
  height={400}
  className="w-full h-full object-cover"
  sizes="100vw"
  priority={false}
/>
```

#### **Pattern 2: Image with fixed width/height**

```typescript
// ❌ Before
<Image
  src={imageUrl}
  alt="Description"
  width={200}
  height={200}
  className="rounded"
/>

// ✅ After
<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={200}
  height={200}
  className="rounded"
  priority={false}
/>
```

#### **Pattern 3: Hero/Above-fold images**

```typescript
// ✅ For images above the fold (hero, banner)
<OptimizedImage
  src={imageUrl}
  alt='Description'
  width={800}
  height={400}
  priority={true} // Only for above-fold images
/>
```

## 🔧 **Quick Search & Replace Commands:**

### **VS Code Find & Replace (Regex):**

1. **Replace Import:**

   - Find: `import Image from 'next/image'`
   - Replace: `import OptimizedImage from '@/components/OptimizedImage'`

2. **Replace fill pattern:**

   - Find: `<Image(\s+[^>]*?)\s+fill\s+([^>]*?)>`
   - Replace: `<OptimizedImage$1 width={400} height={400} className="w-full h-full object-cover" priority={false} $2>`

3. **Replace basic Image:**
   - Find: `<Image(\s+[^>]*?)>`
   - Replace: `<OptimizedImage$1 priority={false}>`

## 🎯 **Files Needing Manual Fix:**

(Based on linter errors)

1. **src/app/(client)/kategori/page.tsx** - Line 41
2. **src/app/(client)/components/Category.tsx** - Line 103, 131
3. **src/app/(client)/components/materialsOffer.tsx** - Line 24

## 🚀 **Test After Changes:**

```bash
npm run dev
# Check browser console for errors
# Test image loading performance
```

## ⚡ **Performance Check:**

1. Open DevTools → Network tab
2. Check image loading times
3. Verify images are lazy loaded
4. Confirm no layout shift (CLS)

## 🎯 **Priority Order:**

1. ✅ Product images (done)
2. ✅ Featured products (done)
3. ✅ Wishlist (done)
4. 🔄 Category pages
5. 🔄 Admin dashboard
6. 🔄 Navigation/footer (done)
