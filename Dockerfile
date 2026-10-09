# ----------------------------------------------------
# Base image: Node.js 20 on Debian-slim (supports OpenSSL & glibc for Prisma)
# ----------------------------------------------------
FROM node:20-slim

# Install OpenSSL, CA certificates, and curl for Prisma and networking
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package manifests AND Prisma schema first
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies (ignoring scripts during install to avoid premature postinstall hooks)
RUN npm install --include=dev --ignore-scripts

# Generate Prisma Client explicitly
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Set build-time DATABASE_URL for Next.js build step
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Build Next.js application
RUN npm run build

# Ensure entrypoint script is executable
RUN chmod +x ./docker-entrypoint.sh

# Expose container port (Render assigns $PORT at runtime, defaults to 3000)
EXPOSE 3000

# Start container using the entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
