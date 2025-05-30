# --- Base Image ---
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# --- Builder Image ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (dev & prod)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js standalone app
RUN npm run build

# --- Runner Image ---
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only the standalone output and necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static .next/static

# Optionally, copy the prisma folder if needed for runtime
COPY --from=builder /app/prisma ./prisma

# Copy node_modules from standalone if required
# Not needed if using standalone mode correctly

# Copy .env if needed
# COPY .env .env

# Jalankan migrasi dan aplikasi
CMD sh -c "npx prisma migrate deploy && node server.js"
