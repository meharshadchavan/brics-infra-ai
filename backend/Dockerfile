# ──────────────────────────────────────────────
# Stage 1: Build / Install dependencies
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build tools needed for native npm modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# ──────────────────────────────────────────────
# Stage 2: Production image
# ──────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --prefer-offline && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/src ./src

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Environment defaults (can be overridden by docker-compose or k8s)
ENV NODE_ENV=production \
    PORT=3001 \
    DEMO_MODE=false \
    DATA_DIR=/app/data

# Start the application
CMD ["node", "src/index.js"]
