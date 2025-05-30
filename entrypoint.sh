#!/bin/sh

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Building seed files..."
npm run build:seed

echo "Seeding database..."
npm run seed

echo "Starting Next.js server..."
node server.js
