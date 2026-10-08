#!/bin/sh
set -e

echo "🚀 Starting YashodhaMart on Render (Docker)..."

# Apply PostgreSQL database migrations and push schema
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Syncing schema with PostgreSQL..."
  npx prisma db push --skip-generate || echo "⚠️ Warning: prisma db push had issues, continuing..."

  echo "🌱 Seeding initial data (categories, products, demo admin & user)..."
  npx tsx prisma/seed.ts || echo "⚠️ Warning: database seeding skipped or already completed"
else
  echo "⚠️ Warning: DATABASE_URL is not set!"
fi

echo "✨ Starting Next.js production server on port ${PORT:-3000} (0.0.0.0)..."
exec npx next start -p ${PORT:-3000} -H 0.0.0.0
