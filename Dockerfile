# Use official Node.js LTS image as the base
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Prisma schema separately (for prisma generate step)
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy hasil build dari builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static .next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME localhost

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js "]