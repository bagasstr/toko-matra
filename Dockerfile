# --- Base Image (Install only production deps) ---
    FROM node:20-alpine AS base
    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev
    
    
    # --- Builder (Full deps + Prisma generate + build Next.js) ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Salin semua file (termasuk prisma/)
    COPY . .
    
    # Install semua dependency (termasuk dev)
    RUN npm ci
    
    # Generate Prisma Client
    RUN npx prisma generate
    
    # Build Next.js standalone
    RUN npm run build
    
    
    # --- Runner Image ---
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Copy hasil build dari builder
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/static .next/static
    
    # Copy prisma folder (untuk schema dan hasil generate)
    COPY --from=builder /app/prisma ./prisma
    
    # Copy generated node_modules (opsional, jika standalone tidak menyertakan semua)
    COPY --from=builder /app/node_modules ./node_modules
    
    # Jalankan migrate & server
    CMD sh -c "npx prisma migrate deploy && npm run seed && node server.js"
    