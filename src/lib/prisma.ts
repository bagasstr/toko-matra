// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Explicitly disable all logging
    log: [],
    // Additional logging configuration to ensure no logs
    errorFormat: 'minimal',
    // Optimize connection pooling for Vercel
    ...(process.env.NODE_ENV === 'production' && {
      transactionOptions: {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
