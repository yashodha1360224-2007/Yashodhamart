#!/bin/sh
set -e

echo "🚀 Starting YashodhaMart on Render (Docker)..."

# Apply PostgreSQL database migrations and push schema
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://placeholder:placeholder@localhost:5432/placeholder" ]; then
  echo "📦 Syncing schema with PostgreSQL..."
  npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ Warning: prisma db push had issues, continuing..."

  echo "🌱 Seeding initial data (categories, products, demo admin & user)..."
  npx tsx prisma/seed.ts || echo "⚠️ Warning: database seeding skipped or already completed"
else
  echo "⚠️ Notice: Real DATABASE_URL is not configured yet! Please set DATABASE_URL in Render Environment settings."
fi

echo "✨ Starting Next.js production server on port ${PORT:-3000} (0.0.0.0)..."
exec npx next start -p ${PORT:-3000} -H 0.0.0.0
