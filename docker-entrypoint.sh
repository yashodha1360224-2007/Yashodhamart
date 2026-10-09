#!/bin/sh
set -e

echo "🚀 Starting YashodhaMart on Render (Docker)..."

# Ensure prisma directory exists
mkdir -p prisma

# Check if a real PostgreSQL DATABASE_URL is configured
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://placeholder:placeholder@localhost:5432/placeholder" ] && echo "$DATABASE_URL" | grep -qE "postgres://|postgresql://"; then
  echo "📦 PostgreSQL DATABASE_URL detected."
  # Normalize postgres:// to postgresql:// (Prisma requires postgresql://)
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/^postgres:\/\//postgresql:\/\//')

  echo "📦 Configuring schema for PostgreSQL..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  npx prisma generate

  echo "📦 Syncing schema with PostgreSQL..."
  npx prisma db push --accept-data-loss || echo "⚠️ Warning: prisma db push had issues, continuing..."

  echo "🌱 Seeding initial PostgreSQL data..."
  npx tsx prisma/seed.ts || echo "⚠️ Warning: database seeding skipped or already completed"

else
  echo "📦 No external PostgreSQL provided. Using self-contained SQLite database..."
  export DATABASE_URL="file:/app/prisma/dev.db"
  sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
  npx prisma generate

  echo "📦 Ensuring SQLite tables are synced..."
  npx prisma db push --accept-data-loss || echo "⚠️ Warning: SQLite db push had issues"

  echo "🌱 Seeding SQLite database if needed..."
  npx tsx prisma/seed.ts || echo "⚠️ Notice: Database already seeded"
fi

echo "✨ Starting Next.js production server on port ${PORT:-3000} (0.0.0.0)..."
exec npx next start -p ${PORT:-3000} -H 0.0.0.0

