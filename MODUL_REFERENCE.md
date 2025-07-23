# 🔍 Quick Reference - Identitas Modul Tokomatra

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        IDENTITAS DOKUMENTASI                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Document ID     : DOC-TOKOMATRA-REFERENCE-002                               ║
║ Document Type   : Quick Reference Guide                                     ║
║ Document Title  : Quick Reference - Identitas Modul Tokomatra              ║
║ Version         : 1.0.0                                                     ║
║ Created Date    : 2025-01-17                                               ║
║ Last Updated    : 2025-01-17                                               ║
║ Status          : Active                                                     ║
║ Classification  : Internal Reference Documentation                          ║
║ Owner           : Development Team                                           ║
║ Reviewers       : Tech Lead                                                 ║
║ Related Docs    : DOKUMENTASI_MODUL.md, README_DOKUMENTASI.md              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📋 Ringkasan Modul Sistem

### **Sistem E-Commerce Bahan Bangunan Tokomatra v0.1.0**

---

## 🆔 **Identitas Modul**

| Modul ID              | Nama Modul                       | Lokasi Utama                                 | Tipe             | Status    |
| --------------------- | -------------------------------- | -------------------------------------------- | ---------------- | --------- |
| `AUTH_MODULE`         | Authentication & User Management | `src/app/(auth)/`                            | Core Security    | ✅ Active |
| `PRODUCT_MODULE`      | Product Management               | `src/app/(admin)/dashboard/produk/`          | Core Business    | ✅ Active |
| `ECOMMERCE_MODULE`    | E-Commerce Core                  | `src/app/(client)/`                          | Core Business    | ✅ Active |
| `ADMIN_MODULE`        | Admin Dashboard                  | `src/app/(admin)/dashboard/`                 | Administrative   | ✅ Active |
| `NOTIFICATION_MODULE` | Notification System              | `src/app/actions/orderStatusNotification.ts` | Communication    | ✅ Active |
| `FILE_MODULE`         | File Management                  | `src/app/actions/blobManagement.ts`          | Asset Management | ✅ Active |
| `API_MODULE`          | API Layer                        | `src/app/api/`                               | Service Layer    | ✅ Active |
| `CLIENT_MODULE`       | Client Interface                 | `src/app/(client)/`                          | User Interface   | ✅ Active |
| `DATABASE_MODULE`     | Database Schema                  | `prisma/schema.prisma`                       | Data Layer       | ✅ Active |
| `CONFIG_MODULE`       | Configuration                    | `src/app/config.ts`                          | System Config    | ✅ Active |

---

## 🗂️ **Pemetaan Entitas Database**

### **Primary Entities**

```
🧑 users (id_user) → User management
📋 profile (id_profile) → User profiles
📍 address (id_address) → User addresses
🛍️ products (id_product) → Product catalog
📂 categories (id_category) → Product categories
🏷️ brands (id_brand) → Product brands
🛒 carts (id_cart) → Shopping carts
📦 orders (id_order) → Customer orders
💳 payments (id_payment) → Payment records
🚚 shipments (id_shipment) → Shipping records
🔔 notifications (id_notification) → User notifications
❤️ wishlist (id_wishlist) → User wishlists
```

---

## 🔗 **API Endpoints Map**

### **Authentication APIs**

```
POST /api/auth/login           # User login
POST /api/auth/register        # User registration
POST /api/auth/logout          # User logout
POST /api/auth/forgot-password # Password recovery
```

### **Product APIs**

```
GET  /api/products/featured    # Featured products
GET  /api/products/search      # Product search
GET  /api/categories          # Category list
GET  /api/brands             # Brand list
POST /api/brands             # Create brand
PUT  /api/brands/[id]        # Update brand
```

### **E-Commerce APIs**

```
POST /api/order              # Create order
GET  /api/orders/[id]        # Get order details
PUT  /api/orders/[id]        # Update order
POST /api/payment            # Process payment
```

### **Admin APIs**

```
GET  /api/dashboard-stats    # Dashboard statistics
GET  /api/notifications      # Get notifications
POST /api/notifications      # Create notification
```

### **File & Integration APIs**

```
POST /api/upload/test            # File upload
GET  /api/images/[...path]       # Image serving
POST /api/generate-pdf           # PDF generation
POST /api/midtrans/callback      # Payment callback
POST /api/midtrans/notification  # Payment notification
```

---

## 📁 **Struktur Direktori Utama**

```
ecommerce_buildings_materials/
├── 🔧 prisma/                   # Database schema & migrations
├── 🌐 public/                   # Static assets
├── 📦 src/
│   ├── 🎯 app/
│   │   ├── 🔐 (auth)/          # AUTH_MODULE
│   │   ├── 👥 (client)/        # CLIENT_MODULE
│   │   ├── 👨‍💼 (admin)/         # ADMIN_MODULE
│   │   ├── ⚡ actions/          # Server actions
│   │   └── 🌐 api/             # API_MODULE
│   ├── 🧩 components/          # Reusable UI components
│   ├── 🪝 hooks/               # Custom React hooks
│   ├── 📚 lib/                 # Utilities & configurations
│   └── 🔷 types/               # TypeScript type definitions
├── 🐳 docker-compose.yml       # Container orchestration
├── 📄 package.json             # Dependencies & scripts
└── 📋 DOKUMENTASI_MODUL.md     # Complete documentation
```

---

## 🔄 **Flow Utama Sistem**

### **User Journey Map**

```
1. 🚪 Registration/Login (AUTH_MODULE)
   └── Profile Setup → Address Management

2. 🛍️ Product Discovery (PRODUCT_MODULE)
   └── Category Browse → Product Search → Product Detail

3. 🛒 Shopping Process (ECOMMERCE_MODULE)
   └── Add to Cart → Cart Review → Checkout

4. 💳 Payment & Order (PAYMENT + ORDER)
   └── Payment Selection → Midtrans → Order Creation

5. 📧 Notifications (NOTIFICATION_MODULE)
   └── Email Confirmation → Status Updates → Order Tracking

6. 👨‍💼 Admin Management (ADMIN_MODULE)
   └── Order Processing → Shipping → Completion
```

---

## 🔧 **Konfigurasi Environment**

### **Required Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Payment (Midtrans)
MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...
NEXT_PUBLIC_MERCHANT_ID=...

# Email Service
EMAIL=...
EMAIL_PASSWORD=...

# File Storage
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
BLOB_READ_WRITE_TOKEN=...

# Application
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_LOGO_BASE64=...
```

---

## 🚀 **Development Commands**

### **Essential Commands**

```bash
# Development
npm run dev                    # Start development server

# Database
npx prisma generate           # Generate Prisma client
npx prisma migrate dev        # Run database migrations
npx prisma studio            # Open database GUI

# Seeding
npm run build:seed           # Compile seed files
npm run seed                 # Run database seeding

# Production
npm run build               # Build for production
npm start                   # Start production server

# Docker
docker-compose up -d        # Start containerized application
docker-compose down         # Stop containers
```

---

## 🔍 **Debugging & Monitoring**

### **Key Monitoring Points**

```
🔍 Authentication Issues → Check AUTH_MODULE logs
📦 Product Display Issues → Verify PRODUCT_MODULE API
🛒 Cart Problems → Inspect ECOMMERCE_MODULE state
💳 Payment Failures → Monitor Midtrans integration
📧 Email Issues → Check NOTIFICATION_MODULE config
📊 Performance → Use React Query DevTools
🗄️ Database → Monitor Prisma query logs
```

---

## 📞 **Module Ownership & Contact**

### **Module Responsibilities**

```
🔐 AUTH_MODULE → Security Team
🛍️ PRODUCT_MODULE → Product Team
🛒 ECOMMERCE_MODULE → Business Logic Team
👨‍💼 ADMIN_MODULE → Admin Interface Team
📧 NOTIFICATION_MODULE → Communication Team
📁 FILE_MODULE → Infrastructure Team
🌐 API_MODULE → Backend Team
📱 CLIENT_MODULE → Frontend Team
🗄️ DATABASE_MODULE → Database Team
⚙️ CONFIG_MODULE → DevOps Team
```

---

## 📈 **Performance Metrics**

### **Key Performance Indicators**

```
⚡ Page Load Time: < 3 seconds
🚀 API Response Time: < 500ms
🗄️ Database Query Time: < 100ms
📧 Email Delivery: < 30 seconds
💾 File Upload Speed: < 10MB/min
🔄 Cache Hit Rate: > 80%
🛡️ Error Rate: < 1%
```

---

## 🔒 **Security Checklist**

### **Security Measures by Module**

```
🔐 AUTH_MODULE:
   ✅ Password hashing (bcryptjs)
   ✅ Session management
   ✅ Role-based access control

🛍️ PRODUCT_MODULE:
   ✅ Input validation (Zod)
   ✅ SQL injection prevention (Prisma)
   ✅ Image upload validation

💳 PAYMENT_MODULE:
   ✅ Secure API keys
   ✅ Webhook verification
   ✅ Transaction logging

📧 NOTIFICATION_MODULE:
   ✅ Email template sanitization
   ✅ Rate limiting
   ✅ Spam prevention
```

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** 2025-01-17  
**Compatibility:** Next.js 15.3.3, React 19, TypeScript 5.8.3

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      DOCUMENT CONTROL INFORMATION                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Document ID     : DOC-TOKOMATRA-REFERENCE-002                               ║
║ Related Docs    : DOC-TOKOMATRA-MODULES-001                                ║
║                   DOC-TOKOMATRA-INDEX-003                                   ║
║                   DOC-TOKOMATRA-CROSSREF-004                                ║
║ Change Control  : All changes must be reviewed and approved                 ║
║ Distribution    : Development Team, Tech Lead                               ║
║ Next Review     : 2025-02-17                                               ║
║ Backup Location : Git Repository /docs folder                               ║
║ Contact Info    : tech-lead@tokomatra.com                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

_Gunakan dokumentasi ini sebagai panduan cepat untuk navigasi sistem. Untuk detail lengkap, lihat DOC-TOKOMATRA-MODULES-001_
