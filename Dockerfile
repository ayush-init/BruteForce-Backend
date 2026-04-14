# Stage 1: Build
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src
# Copy scripts if they are needed for build or run
# COPY scripts ./scripts

# Build TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application and generated Prisma client
COPY --from=builder /app/dist ./dist
# Prisma client needs these two specifically when copied manually, or better yet, generate it in prod stage.
# To avoid missing Prisma dependencies or extensions, it's often safer to re-generate in the final stage,
# or simply copy the entire node_modules from builder. But for smaller images:
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# If you use Prisma Accelerate, the extension needs to be available
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Start command
CMD ["npm", "start"]
