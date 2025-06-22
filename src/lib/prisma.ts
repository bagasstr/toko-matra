// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize connection pooling for Vercel
    ...(process.env.NODE_ENV === 'production' && {
      transactionOptions: {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
