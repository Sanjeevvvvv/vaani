# Stage 1: Build Client and Server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root, server, and client package files
COPY package.json ./
COPY server/package.json server/tsconfig.json ./server/
COPY client/package.json client/tsconfig*.json client/vite.config.ts client/tailwind.config.js client/postcss.config.js ./client/

# Install dependencies
RUN npm --prefix server install
RUN npm --prefix client install

# Copy source code and static assets
COPY server ./server
COPY client ./client

# Build client and server
RUN npm --prefix client run build
RUN npm --prefix server run build

# Stage 2: Production Minimal Container
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy server package and install production dependencies only
COPY server/package.json ./server/
RUN npm --prefix server install --omit=dev && npm cache clean --force

# Copy built server and data
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/data ./server/data

# Copy built client to where the server serves static files from
COPY --from=builder /app/client/dist ./client/dist

# Security: Run as non-root node user
USER node

EXPOSE 8080

CMD ["node", "server/dist/index.js"]
