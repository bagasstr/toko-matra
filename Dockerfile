# --- Builder stage ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy only necessary files
    COPY package.json package-lock.json ./
    RUN npm install
    
    # Copy entire project
    COPY . .
    

   
    # Generate Prisma Client
    RUN npx prisma generate
    
    # Build Next.js
    RUN npm run build
    
    
    # --- Production Image ---
    FROM node:20-alpine

    
    WORKDIR /app
    
    RUN apk add --no-cache openssl
    
    # Copy necessary files from builder
    COPY --from=builder /app/package.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/static .next/static
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/adminSeed.ts ./
    COPY --from=builder /app/categorySeed.ts ./
    COPY --from=builder /app/tsconfig.seed.json ./
    COPY --from=builder /app/dist ./dist

    # Expose the port
    EXPOSE 3000
    
    # Start the server (with migration)
    CMD ["sh", "-c", "npx prisma migrate deploy && npm run build:seed && npm run seed && node server.js"]
    