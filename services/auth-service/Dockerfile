# ==========================================
# Multi-stage Dockerfile: Auth Service
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

# 1. Cài đặt dependency cho thư viện shared dùng chung
COPY shared/package*.json ./shared/
RUN npm ci --prefix shared

# 2. Cài đặt dependency cho service
COPY services/auth-service/package*.json ./services/auth-service/
RUN cd services/auth-service && npm ci

# 3. Sao chép mã nguồn & generate Prisma Client
COPY shared/ ./shared/
COPY services/auth-service/ ./services/auth-service/
RUN cd services/auth-service && npm run db:generate --if-present

# ==========================================
# Production Runtime Stage (Non-root user)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/shared ./shared
COPY --from=builder --chown=nodeapp:nodejs /app/services/auth-service ./services/auth-service

USER nodeapp
WORKDIR /app/services/auth-service
EXPOSE 5001

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

CMD ["node", "server.js"]
