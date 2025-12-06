# Multi-stage build for TanStack Start application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Set to production environment
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tanstack

# Copy necessary files from builder
COPY --from=builder --chown=tanstack:nodejs /app/package.json ./package.json
COPY --from=builder --chown=tanstack:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=tanstack:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=tanstack:nodejs /app/.output ./.output
COPY --from=builder --chown=tanstack:nodejs /app/public ./public
COPY --from=builder --chown=tanstack:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=tanstack:nodejs /app/src ./src

# Switch to non-root user
USER tanstack

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["node", ".output/server/index.mjs"]
