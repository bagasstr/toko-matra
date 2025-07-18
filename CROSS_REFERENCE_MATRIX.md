# 🔗 Cross-Reference Matrix - Dependencies Modul Tokomatra

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        IDENTITAS DOKUMENTASI                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Document ID     : DOC-TOKOMATRA-CROSSREF-004                                ║
║ Document Type   : Cross-Reference Dependencies Matrix                       ║
║ Document Title  : Cross-Reference Matrix - Dependencies Modul Tokomatra    ║
║ Version         : 1.0.0                                                     ║
║ Created Date    : 2025-01-17                                               ║
║ Last Updated    : 2025-01-17                                               ║
║ Status          : Active                                                     ║
║ Classification  : Internal Technical Reference                              ║
║ Owner           : Development Team                                           ║
║ Reviewers       : Tech Lead, Architecture Team                             ║
║ Related Docs    : All Module Documentation                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📊 **Dependencies Matrix**

### **Module Dependencies Overview**

| Module                | Depends On                                    | Used By                                       | Status    | Priority |
| --------------------- | --------------------------------------------- | --------------------------------------------- | --------- | -------- |
| `AUTH_MODULE`         | DATABASE_MODULE, CONFIG_MODULE                | ECOMMERCE_MODULE, ADMIN_MODULE, CLIENT_MODULE | ✅ Active | Critical |
| `PRODUCT_MODULE`      | DATABASE_MODULE, FILE_MODULE, API_MODULE      | ECOMMERCE_MODULE, ADMIN_MODULE                | ✅ Active | Critical |
| `ECOMMERCE_MODULE`    | AUTH_MODULE, PRODUCT_MODULE, DATABASE_MODULE  | CLIENT_MODULE, ADMIN_MODULE                   | ✅ Active | Critical |
| `ADMIN_MODULE`        | AUTH_MODULE, PRODUCT_MODULE, ECOMMERCE_MODULE | -                                             | ✅ Active | High     |
| `NOTIFICATION_MODULE` | DATABASE_MODULE, CONFIG_MODULE                | ECOMMERCE_MODULE, ADMIN_MODULE                | ✅ Active | High     |
| `FILE_MODULE`         | CONFIG_MODULE                                 | PRODUCT_MODULE, ADMIN_MODULE                  | ✅ Active | Medium   |
| `API_MODULE`          | DATABASE_MODULE, AUTH_MODULE                  | All Frontend Modules                          | ✅ Active | Critical |
| `CLIENT_MODULE`       | AUTH_MODULE, ECOMMERCE_MODULE, API_MODULE     | -                                             | ✅ Active | High     |
| `DATABASE_MODULE`     | CONFIG_MODULE                                 | All Modules                                   | ✅ Active | Critical |
| `CONFIG_MODULE`       | -                                             | All Modules                                   | ✅ Active | Critical |

---

## 🔍 **Module Code Mapping**

### **Unique Module Codes**

```
TKM-AUTH-001   → Authentication & User Management
TKM-PROD-002   → Product Management
TKM-ECOM-003   → E-Commerce Core
TKM-ADMN-004   → Admin Dashboard
TKM-NOTF-005   → Notification System
TKM-FILE-006   → File Management
TKM-API-007    → API Layer
TKM-CLNT-008   → Client Interface
TKM-DB-009     → Database Schema
TKM-CONF-010   → Configuration
```

---

## 🗂️ **File Location Cross-Reference**

### **Primary Locations by Module**

#### **TKM-AUTH-001** - Authentication Module

```
📁 Primary: src/app/(auth)/
├── 🔐 login-admin/page.tsx
├── 📝 daftar-akun/page.tsx
├── 🔑 lupa-password/page.tsx
└── 📋 layout.tsx

📁 Actions: src/app/actions/
├── ⚡ login.ts
├── ⚡ registrasi.ts
├── ⚡ session.ts
└── ⚡ verificationToken.ts
```

#### **TKM-PROD-002** - Product Management Module

```
📁 Primary: src/app/(admin)/dashboard/produk/
├── 📦 page.tsx
├── ➕ tambah-produk/page.tsx
├── ✏️ edit/[id]/page.tsx
├── 👁️ detail/[id]/page.tsx
├── 📂 kategori/page.tsx
└── 🏷️ merek/page.tsx

📁 Actions: src/app/actions/
├── ⚡ productAction.ts
├── ⚡ categoryAction.ts
└── ⚡ brandAction.ts
```

#### **TKM-ECOM-003** - E-Commerce Core Module

```
📁 Primary: src/app/(client)/
├── 🛒 keranjang/page.tsx
├── 💳 checkout/page.tsx
├── 📦 orders/page.tsx
└── ❤️ wishlist/page.tsx

📁 Store: src/lib/
├── ⚡ cartStore.ts
└── ⚡ store.ts
```

#### **TKM-API-007** - API Layer Module

```
📁 Primary: src/app/api/
├── 🔐 auth/
├── 📦 products/
├── 🛒 order/
├── 💳 payment/
├── 📧 notifications/
├── 📁 upload/
├── 🖼️ images/
└── 🧾 generate-pdf/
```

---

## 🔄 **Data Flow Matrix**

### **Critical Data Flows**

#### **User Authentication Flow**

```
TKM-AUTH-001 → TKM-DB-009 → TKM-API-007 → TKM-CLNT-008
     ↓              ↓              ↓              ↓
Session        User Data      API Response   UI Update
```

#### **Product Management Flow**

```
TKM-PROD-002 → TKM-FILE-006 → TKM-DB-009 → TKM-API-007
     ↓              ↓              ↓              ↓
Product Data   Image Upload   Database      API Response
```

#### **E-Commerce Transaction Flow**

```
TKM-ECOM-003 → TKM-AUTH-001 → TKM-PROD-002 → TKM-DB-009 → TKM-NOTF-005
     ↓              ↓              ↓              ↓              ↓
Cart Update    User Auth      Product Info   Order Save     Email Send
```

---

## 🔗 **API Endpoint Cross-Reference**

### **Authentication Endpoints**

| Endpoint             | Module Code  | Method | Description       |
| -------------------- | ------------ | ------ | ----------------- |
| `/api/auth/login`    | TKM-AUTH-001 | POST   | User login        |
| `/api/auth/register` | TKM-AUTH-001 | POST   | User registration |
| `/api/user`          | TKM-AUTH-001 | GET    | Get user profile  |

### **Product Endpoints**

| Endpoint                 | Module Code  | Method   | Description       |
| ------------------------ | ------------ | -------- | ----------------- |
| `/api/products/featured` | TKM-PROD-002 | GET      | Featured products |
| `/api/products/search`   | TKM-PROD-002 | GET      | Product search    |
| `/api/categories`        | TKM-PROD-002 | GET      | Category list     |
| `/api/brands`            | TKM-PROD-002 | GET/POST | Brand operations  |

### **E-Commerce Endpoints**

| Endpoint           | Module Code  | Method | Description     |
| ------------------ | ------------ | ------ | --------------- |
| `/api/order`       | TKM-ECOM-003 | POST   | Create order    |
| `/api/orders/[id]` | TKM-ECOM-003 | GET    | Order details   |
| `/api/payment`     | TKM-ECOM-003 | POST   | Process payment |

---

## 🗄️ **Database Entity Cross-Reference**

### **Entity Relationships**

#### **User Management Entities**

```
users (TKM-AUTH-001)
├── profile (TKM-AUTH-001)
├── address (TKM-AUTH-001)
├── sessions (TKM-AUTH-001)
└── notifications (TKM-NOTF-005)
```

#### **Product Catalog Entities**

```
products (TKM-PROD-002)
├── categories (TKM-PROD-002)
├── brands (TKM-PROD-002)
└── wishlist (TKM-ECOM-003)
```

#### **E-Commerce Core Entities**

```
orders (TKM-ECOM-003)
├── order_items (TKM-ECOM-003)
├── payments (TKM-ECOM-003)
├── carts (TKM-ECOM-003)
├── cart_items (TKM-ECOM-003)
└── shipments (TKM-ECOM-003)
```

---

## 🚨 **Impact Analysis Matrix**

### **Critical Dependencies**

```
🔴 High Impact Changes:
- TKM-DB-009 (Database) → Affects ALL modules
- TKM-AUTH-001 (Auth) → Affects all user-facing modules
- TKM-API-007 (API) → Affects all frontend interactions

🟡 Medium Impact Changes:
- TKM-PROD-002 (Product) → Affects e-commerce flow
- TKM-ECOM-003 (E-Commerce) → Affects business operations

🟢 Low Impact Changes:
- TKM-FILE-006 (File) → Limited to asset management
- TKM-NOTF-005 (Notification) → Communication only
```

### **Testing Priority by Dependencies**

```
Priority 1: TKM-DB-009, TKM-AUTH-001, TKM-API-007
Priority 2: TKM-PROD-002, TKM-ECOM-003, TKM-CONF-010
Priority 3: TKM-ADMN-004, TKM-CLNT-008
Priority 4: TKM-FILE-006, TKM-NOTF-005
```

---

## 📋 **Change Management Checklist**

### **Before Making Changes**

```
□ Identify affected modules using this matrix
□ Check impact level (High/Medium/Low)
□ Review dependencies chain
□ Plan testing strategy based on priority
□ Notify relevant team owners
□ Update related documentation
```

### **Module Change Impact Assessment**

```
1. List target module code (e.g., TKM-PROD-002)
2. Check "Used By" column for dependent modules
3. Review "Depends On" column for prerequisite modules
4. Assess data flow implications
5. Plan rollback strategy for critical dependencies
```

---

## 🔄 **Version Control Integration**

### **Git Branch Naming by Module**

```
feature/TKM-AUTH-001-login-improvement
fix/TKM-PROD-002-product-search-bug
refactor/TKM-ECOM-003-cart-optimization
docs/TKM-API-007-endpoint-documentation
```

### **Commit Message Format**

```
[TKM-XXXX-XXX] Type: Brief description

Example:
[TKM-AUTH-001] feat: Add two-factor authentication
[TKM-PROD-002] fix: Product image upload validation
[TKM-ECOM-003] refactor: Cart state management optimization
```

---

**Cross-Reference Matrix Version:** 1.0.0  
**Compatibility:** Tokomatra v0.1.0  
**Last Updated:** 2025-01-17  
**Next Review:** 2025-02-17

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      DOCUMENT CONTROL INFORMATION                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ This document is controlled and maintained by the Development Team.         ║
║ Any changes must be approved and reviewed before implementation.            ║
║ For questions or updates, contact: tech-lead@tokomatra.com                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
