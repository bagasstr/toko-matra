# --- Base Image (Install only production deps) ---
    FROM node:20-alpine AS base
    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev
    
    # --- Builder (Full deps + Prisma + Build + Seed) ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Copy semua file
    COPY . .
    
    # Install semua dependencies
    RUN npm ci
    
    # Generate Prisma client
    RUN npx prisma generate

    # Build Next.js app dengan output standalone
    RUN npm run build
    
    # --- Runner (Lightweight container) ---
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Copy hasil build standalone dari builder
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/static .next/static
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/node_modules ./node_modules
    
    # Jalankan aplikasi
    CMD ["node", "server.js"]
    