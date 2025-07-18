# 📋 Dokumentasi Modul Sistem E-Commerce Tokomatra

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        IDENTITAS DOKUMENTASI                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Document ID     : DOC-TOKOMATRA-MODULES-001                                 ║
║ Document Type   : Technical Architecture Documentation                      ║
║ Document Title  : Dokumentasi Modul Sistem E-Commerce Tokomatra            ║
║ Version         : 1.0.0                                                     ║
║ Created Date    : 2025-01-17                                               ║
║ Last Updated    : 2025-01-17                                               ║
║ Status          : Active                                                     ║
║ Classification  : Internal Technical Documentation                          ║
║ Owner           : Development Team                                           ║
║ Reviewers       : Tech Lead, Product Manager                               ║
║ Related Docs    : MODUL_REFERENCE.md, README_DOKUMENTASI.md                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📊 Identitas Aplikasi

**Nama Aplikasi:** Tokomatra - E-Commerce Bahan Bangunan  
**Versi:** 0.1.0  
**Platform:** Web Application  
**Framework:** Next.js 15.3.3 dengan TypeScript  
**Database:** PostgreSQL dengan Prisma ORM

---

## 🏗️ Arsitektur Teknologi

### **Stack Teknologi Utama**

```
Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
Backend: Next.js API Routes + Prisma ORM
Database: PostgreSQL
Authentication: Custom Auth dengan bcryptjs
Payment: Midtrans Integration
Email: Nodemailer
File Storage: Vercel Blob + Supabase
State Management: Zustand + React Query
UI Components: Radix UI + shadcn/ui
```

### **Deployment**

- **Container:** Docker dengan Docker Compose
- **Environment:** Production/Development
- **Port:** 3000 (container), 4000 (host)

---

## 📂 Struktur Modul Utama

## 1. 🔐 **Authentication & User Management Module**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IDENTITAS MODUL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Module ID       : AUTH_MODULE                                               │
│ Module Code     : TKM-AUTH-001                                             │
│ Module Name     : Authentication & User Management                         │
│ Module Type     : Core Security Module                                     │
│ Priority Level  : Critical                                                 │
│ Status          : Active                                                    │
│ Owner Team      : Security Team                                            │
│ Dependencies    : DATABASE_MODULE, CONFIG_MODULE                           │
│ Primary Location: src/app/(auth)/                                          │
│ Related Actions : src/app/actions/login.ts, registrasi.ts                 │
│ Last Updated    : 2025-01-17                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Identitas Modul**

- **ID:** `AUTH_MODULE`
- **Lokasi:** `src/app/(auth)/`, `src/app/actions/login.ts`, `src/app/actions/registrasi.ts`
- **Tipe:** Core Security Module

### **Fitur Utama**

```typescript
// User Management
- Login/Logout
- Registration (Individu/Perusahaan/Toko)
- Email Verification
- Forgot Password
- Profile Management
- Session Management
```

### **Role System**

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

enum UserType {
  INDIVIDU = 'individu',
  PERUSAHAAN = 'perusahaan',
  TOKO = 'toko',
}
```

### **File Struktur**

```
src/app/(auth)/
├── login-admin/page.tsx         # Admin login page
├── daftar-akun/                 # Registration module
│   ├── page.tsx
│   └── components/FormRegistrasi.tsx
├── lupa-password/               # Password recovery
│   ├── page.tsx
│   └── components/ForgotPasswordForm.tsx
└── layout.tsx                   # Auth layout wrapper

src/app/actions/
├── login.ts                     # Login action
├── registrasi.ts               # Registration action
├── session.ts                  # Session management
├── profile.ts                  # Profile actions
└── verificationToken.ts        # Email verification
```

---

## 2. 🛍️ **Product Management Module**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IDENTITAS MODUL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Module ID       : PRODUCT_MODULE                                            │
│ Module Code     : TKM-PROD-002                                             │
│ Module Name     : Product Management                                       │
│ Module Type     : Core Business Module                                     │
│ Priority Level  : Critical                                                 │
│ Status          : Active                                                    │
│ Owner Team      : Product Team                                             │
│ Dependencies    : DATABASE_MODULE, FILE_MODULE, API_MODULE                 │
│ Primary Location: src/app/(admin)/dashboard/produk/                        │
│ Related Actions : src/app/actions/productAction.ts                        │
│ Last Updated    : 2025-01-17                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Identitas Modul**

- **ID:** `PRODUCT_MODULE`
- **Lokasi:** `src/app/(admin)/dashboard/produk/`, `src/app/actions/productAction.ts`
- **Tipe:** Core Business Module

### **Entitas Utama**

```typescript
// Product Entity
interface Product {
  id: string (ID_PRODUCT)
  sku: string (unique)
  name: string
  slug: string (unique)
  description: string
  label: "ready stock" | "suplier"
  images: string[]
  price: number
  unit: string (kg, m, m2, dll)
  stock: number
  minOrder: number
  multiOrder: number
  weight: number
  dimensions: string
  isFeatured: boolean
  isActive: boolean
  categoryId: string
  brandId: string
}

// Category Entity
interface Category {
  id: string (ID_CATEGORY)
  name: string
  slug: string (unique)
  description: string
  icon: string
  imageUrl: string
  isActive: boolean
  parentId: string (hierarchical)
}

// Brand Entity
interface Brand {
  id: string (ID_BRAND)
  name: string
  logo: string
  slug: string (unique)
}
```

### **File Struktur**

```
src/app/(admin)/dashboard/produk/
├── page.tsx                     # Product listing dashboard
├── tambah-produk/page.tsx       # Add product form
├── edit/[id]/page.tsx          # Edit product form
├── detail/[id]/page.tsx        # Product detail view
├── kategori/page.tsx           # Category management
└── merek/page.tsx              # Brand management

src/app/actions/
├── productAction.ts            # Product CRUD operations
├── categoryAction.ts           # Category operations
└── brandAction.ts              # Brand operations
```

### **API Endpoints**

```
GET    /api/products/featured    # Featured products
GET    /api/products/search      # Product search
GET    /api/categories          # Category list
GET    /api/brands             # Brand list
POST   /api/brands             # Create brand
PUT    /api/brands/[id]        # Update brand
DELETE /api/brands/[id]        # Delete brand
```

---

## 3. 🛒 **E-Commerce Core Module**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IDENTITAS MODUL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Module ID       : ECOMMERCE_MODULE                                          │
│ Module Code     : TKM-ECOM-003                                             │
│ Module Name     : E-Commerce Core                                          │
│ Module Type     : Core Business Module                                     │
│ Priority Level  : Critical                                                 │
│ Status          : Active                                                    │
│ Owner Team      : Business Logic Team                                      │
│ Dependencies    : AUTH_MODULE, PRODUCT_MODULE, DATABASE_MODULE             │
│ Primary Location: src/app/(client)/                                        │
│ Related Store   : src/lib/cartStore.ts                                    │
│ Last Updated    : 2025-01-17                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Identitas Modul**

- **ID:** `ECOMMERCE_MODULE`
- **Lokasi:** `src/app/(client)/`, `src/lib/cartStore.ts`
- **Tipe:** Core Business Module

### **Sub-Modul**

#### **3.1 Shopping Cart**

```typescript
// Cart Entity
interface Cart {
  id: string (ID_CART)
  userId: string
  items: CartItem[]
}

interface CartItem {
  id: string (ID_CARTITEM)
  cartId: string
  productId: string
  quantity: number
}
```

**Lokasi:** `src/app/(client)/keranjang/`, `src/lib/cartStore.ts`

#### **3.2 Checkout & Orders**

```typescript
// Order Entity
interface Order {
  id: string (ID_ORDER)
  userId: string
  status: OrderStatus
  totalAmount: number
  subtotalAmount: number
  addressId: string
  items: OrderItem[]
}

enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}
```

**Lokasi:** `src/app/(client)/checkout/`, `src/app/(client)/orders/`

#### **3.3 Payment Integration**

```typescript
// Payment Entity
interface Payment {
  id: string (ID_PAYMENT)
  orderId: string
  amount: number
  paymentMethod: string
  transactionId: string
  transactionStatus: string
  bank: string
  vaNumber: string
}
```

**Lokasi:** `src/app/api/midtrans/`, `src/lib/midtransClient.ts`

### **File Struktur**

```
src/app/(client)/
├── keranjang/                   # Shopping cart
│   ├── page.tsx
│   ├── CartClient.tsx
│   └── pembayaran/page.tsx
├── checkout/page.tsx            # Checkout process
├── orders/                      # Order management
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── [id]/cancel/page.tsx
└── payment/                     # Payment handling
    ├── success/page.tsx
    ├── pending/
    └── error/

src/app/api/
├── order/route.ts              # Order API
├── payment/route.ts            # Payment API
└── midtrans/                   # Midtrans integration
    ├── callback/
    ├── notification/route.ts
    └── sync-status/route.ts
```

---

## 4. 📊 **Admin Dashboard Module**

### **Identitas Modul**

- **ID:** `ADMIN_MODULE`
- **Lokasi:** `src/app/(admin)/dashboard/`
- **Tipe:** Administrative Module

### **Sub-Modul Dashboard**

#### **4.1 Analytics & Statistics**

```typescript
interface DashboardStats {
  newOrders: number
  totalCustomers: number
  lowStockProducts: number
  bestSellingProduct: string
  revenue: number
}
```

#### **4.2 Order Management**

```typescript
// Order Dashboard Features
- Order listing dengan filter status
- Order detail view
- Status update (CONFIRMED → SHIPPED → DELIVERED)
- Payment verification
- Shipping management
- PDF generation (Invoice, Surat Jalan)
```

#### **4.3 Customer Management**

```typescript
// Customer Features
- Customer listing
- Customer profile view
- Order history per customer
- Communication tools
```

### **File Struktur**

```
src/app/(admin)/dashboard/
├── page.tsx                     # Main dashboard
├── components/                  # Dashboard components
│   ├── Dashboard-card.tsx
│   ├── ChartImplementation.tsx
│   └── Dashboard-nav.tsx
├── pesanan/                     # Order management
│   ├── page.tsx
│   ├── OrderDashboard.tsx
│   └── detail-pesanan/[id]/page.tsx
├── pelanggan/                   # Customer management
│   ├── page.tsx
│   └── ClientCustomerPage.tsx
├── admin/                       # Admin user management
│   ├── page.tsx
│   └── components/AdminManagement.tsx
├── statistik/page.tsx           # Statistics view
└── surat-jalan/                 # Shipping documents
    ├── page.tsx
    └── tableSuratJalan.tsx
```

---

## 5. 📧 **Notification System Module**

### **Identitas Modul**

- **ID:** `NOTIFICATION_MODULE`
- **Lokasi:** `src/app/actions/orderStatusNotification.ts`, `src/lib/sendmailerTransport.ts`
- **Tipe:** Communication Module

### **Fitur Notifikasi**

#### **5.1 Email Notifications**

```typescript
// Email Types
enum EmailType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
}

// Email Service
interface EmailService {
  sendOrderStatusEmail(orderId: string, status: OrderStatus): Promise<void>
  sendWelcomeEmail(userId: string): Promise<void>
  sendPasswordResetEmail(email: string, token: string): Promise<void>
}
```

#### **5.2 In-App Notifications**

```typescript
// Notification Entity
interface Notification {
  id: string (ID_NOTIFICATION)
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
```

### **Template Email**

- **Design:** Responsive HTML templates
- **Branding:** Matrakosala brand consistency
- **Content:** Order details, status updates, CTAs
- **Localization:** Indonesian language support

### **File Struktur**

```
src/app/actions/
├── orderStatusNotification.ts   # Email notification logic
├── notificationAction.ts        # In-app notifications
└── paymentNotification.ts       # Payment notifications

src/lib/
└── sendmailerTransport.ts       # Email service & templates

src/app/(client)/notifikasi/
├── page.tsx                     # Notification center
└── components/
    ├── NotificationBadge.tsx
    └── NotificationItem.tsx
```

---

## 6. 📁 **File Management Module**

### **Identitas Modul**

- **ID:** `FILE_MODULE`
- **Lokasi:** `src/app/actions/blobManagement.ts`, `src/app/api/upload/`
- **Tipe:** Asset Management Module

### **Storage Integration**

```typescript
// Storage Providers
- Vercel Blob (primary)
- Supabase (secondary)
- Local storage (development)

// File Types Supported
- Images: PNG, JPG, JPEG (products, profiles, categories)
- Documents: PDF (invoices, reports)
```

### **PDF Generation**

```typescript
// PDF Types
enum PDFType {
  INVOICE = 'invoice',
  DELIVERY_NOTE = 'delivery_note',
  PROFORMA = 'proforma',
  PURCHASE_ORDER = 'purchase_order',
}

// PDF Services
interface PDFService {
  generateInvoice(orderId: string): Promise<Buffer>
  generateDeliveryNote(shipmentId: string): Promise<Buffer>
  generateProforma(cartId: string): Promise<Buffer>
}
```

### **File Struktur**

```
src/components/pdf/
└── PdfDocument.tsx              # PDF component

src/lib/
├── pdfCartFormatter.ts          # Cart PDF formatter
├── pdfFakturFormatter.ts        # Invoice PDF formatter
├── pdfSJFormatter.tsx           # Delivery note formatter
└── pdfProInvFormatter.ts        # Proforma PDF formatter

src/app/api/
├── generate-pdf/route.ts        # PDF generation API
├── upload/                      # File upload APIs
└── images/[...path]/route.ts    # Image serving API

src/app/actions/
├── blobManagement.ts            # File management actions
└── pdfAction.ts                 # PDF generation actions
```

---

## 7. 🌐 **API Layer Module**

### **Identitas Modul**

- **ID:** `API_MODULE`
- **Lokasi:** `src/app/api/`
- **Tipe:** Service Layer Module

### **API Endpoints Map**

```typescript
// Authentication APIs
POST / api / auth / login
POST / api / auth / register
POST / api / auth / logout
POST / api / auth / forgot - password

// Product APIs
GET / api / products / featured
GET / api / products / search
GET / api / categories
GET / api / brands
POST / api / brands
PUT / api / brands / [id]

// E-commerce APIs
POST / api / order
GET / api / orders / [id]
PUT / api / orders / [id]
POST / api / payment

// Admin APIs
GET / api / dashboard - stats
GET / api / notifications
POST / api / notifications

// File APIs
POST / api / upload / test
GET / api / images / [...path]
GET / api / images - cached / [...path]
POST / api / generate - pdf

// Integration APIs
POST / api / midtrans / callback
POST / api / midtrans / notification
POST / api / midtrans / sync - status
```

### **API Standards**

```typescript
// Response Format
interface APIResponse<T> {
  success: boolean
  message: string
  data: T | null
  errors?: string[]
}

// Error Handling
enum ErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  SERVER_ERROR = 500,
}
```

---

## 8. 📱 **Client Interface Module**

### **Identitas Modul**

- **ID:** `CLIENT_MODULE`
- **Lokasi:** `src/app/(client)/`
- **Tipe:** User Interface Module

### **Halaman Utama**

```typescript
// Public Pages
- Homepage (/)
- Product Catalog (/kategori)
- Product Detail (/kategori/[...slug])
- FAQ (/faq)
- Terms & Privacy (/syarat-ketentuan, /kebijakan-privasi)

// Authenticated Pages
- Profile (/profile)
- Cart (/keranjang)
- Checkout (/checkout)
- Orders (/orders)
- Wishlist (/wishlist)
- Notifications (/notifikasi)
```

### **Responsive Design**

```typescript
// Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

// UI Components
- Navbar (desktop/mobile variants)
- Footer (desktop/mobile variants)
- Product Cards
- Category Cards
- Cart Components
```

### **Performance Optimizations**

```typescript
// Loading Strategies
- Suspense boundaries
- Lazy loading components
- Image optimization
- Code splitting
- React Query caching
```

---

## 9. 🗄️ **Database Schema Module**

### **Identitas Modul**

- **ID:** `DATABASE_MODULE`
- **Lokasi:** `prisma/schema.prisma`, `src/lib/prisma.ts`
- **Tipe:** Data Layer Module

### **Tabel Utama**

```sql
-- User Management
users (id_user, email, password, role, typeUser)
profile (id_profile, userId, fullName, phoneNumber, email, companyName)
address (id_address, userId, recipientName, address, city, province)

-- Product Catalog
products (id_product, sku, name, slug, price, stock, categoryId, brandId)
categories (id_category, name, slug, parentId, isActive)
brands (id_brand, name, logo, slug)

-- E-commerce Core
carts (id_cart, userId)
cart_items (id_cartItem, cartId, productId, quantity)
orders (id_order, userId, status, totalAmount, addressId)
order_items (id_orderItem, orderId, productId, quantity, price)

-- Payment & Shipping
payments (id_payment, orderId, amount, paymentMethod, transactionId)
shipments (id_shipment, orderId, deliveryNumber, deliveryDate)
shipment_items (id_shipmentItem, shipmentId, productId, quantity)

-- Additional Features
notifications (id_notification, userId, title, message, isRead)
wishlist (id_wishlist, userId, productId)
sessions (id, userId, sessionToken, expires)
```

### **Relasi Database**

```typescript
// One-to-One
User → Profile
Order → Shipment

// One-to-Many
User → Address[]
User → Order[]
Category → Product[]
Order → OrderItem[]
Cart → CartItem[]

// Many-to-Many
User → Wishlist ← Product
```

---

## 10. 🔧 **Configuration Module**

### **Identitas Modul**

- **ID:** `CONFIG_MODULE`
- **Lokasi:** `src/app/config.ts`, Environment Variables
- **Tipe:** System Configuration Module

### **Environment Variables**

```typescript
// Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

// Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

// Payment (Midtrans)
MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...
NEXT_PUBLIC_MERCHANT_ID=...

// Email (Nodemailer)
EMAIL=...
EMAIL_PASSWORD=...

// Storage
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
BLOB_READ_WRITE_TOKEN=...

// App Settings
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_LOGO_BASE64=...
```

### **Dynamic Routes Configuration**

```typescript
// Route Configuration
export const dynamicRoutes = [
  '/',
  '/kategori/[...slug]',
  '/dashboard/produk/[id]',
  '/orders/[id]',
  // ... other dynamic routes
]
```

---

## 📈 **Performance & Monitoring**

### **Performance Optimizations**

```typescript
// Frontend Performance
- React Query dengan caching strategy
- Suspense untuk lazy loading
- Image optimization dengan Next.js Image
- Bundle optimization dengan code splitting
- Zustand untuk state management

// Backend Performance
- Database query optimization
- Connection pooling dengan Prisma
- API response caching
- File compression untuk assets
```

### **Monitoring & Logging**

```typescript
// Error Tracking
- Try-catch blocks untuk error handling
- Graceful degradation untuk failed requests
- Console logging untuk debugging

// Performance Monitoring
- React Query devtools
- Database query monitoring
- API response time tracking
```

---

## 🚀 **Deployment & DevOps**

### **Container Configuration**

```dockerfile
# Multi-stage Docker build
FROM node:20-alpine AS builder
# ... build process

FROM node:20-alpine
# ... production image
EXPOSE 3000
```

### **Environment Setup**

```yaml
# docker-compose.yml
services:
  nextjs:
    image: ghcr.io/bagasstr/toko-matrakosala:0.2
    ports: ['4000:3000']
    depends_on: [db]

  db:
    image: postgres:15-alpine
    ports: ['5432:5432']
```

---

## 📋 **Development Guidelines**

### **Code Standards**

- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Component-based architecture
- Functional programming patterns

### **Testing Strategy**

- Unit tests untuk utility functions
- Integration tests untuk API endpoints
- Component testing dengan React Testing Library
- E2E testing untuk critical user flows

### **Security Measures**

- Input validation dengan Zod schemas
- SQL injection prevention dengan Prisma
- XSS protection dengan content sanitization
- CSRF protection untuk state-changing operations
- Environment variable security

---

## 📞 **Support & Maintenance**

### **Dokumentasi Teknis**

- API documentation dengan Swagger/OpenAPI
- Database schema documentation
- Component storybook
- Deployment guides

### **Monitoring Checklist**

- [ ] Database performance monitoring
- [ ] API endpoint health checks
- [ ] Error rate monitoring
- [ ] User activity tracking
- [ ] Security vulnerability scanning

---

**Versi Dokumentasi:** 1.0.0  
**Tanggal Update:** 2025-01-17  
**Author:** Development Team  
**Status:** Active Development

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      DOCUMENT CONTROL INFORMATION                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Document ID     : DOC-TOKOMATRA-MODULES-001                                 ║
║ Related Docs    : DOC-TOKOMATRA-REFERENCE-002                              ║
║                   DOC-TOKOMATRA-INDEX-003                                   ║
║                   DOC-TOKOMATRA-CROSSREF-004                                ║
║ Change Control  : All changes must be reviewed and approved                 ║
║ Distribution    : Development Team, Tech Lead, Product Manager              ║
║ Next Review     : 2025-02-17                                               ║
║ Backup Location : Git Repository /docs folder                               ║
║ Contact Info    : tech-lead@tokomatra.com                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

_Dokumentasi ini akan diperbarui seiring dengan perkembangan aplikasi. Pastikan untuk selalu menggunakan versi terbaru dengan Document ID yang sesuai._
