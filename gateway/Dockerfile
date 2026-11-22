# ==========================================
# Multi-stage Dockerfile: API Gateway
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY gateway/package*.json ./gateway/
RUN cd gateway && npm ci

COPY gateway/ ./gateway/

# ==========================================
# Production Runtime Stage (Non-root user)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app/gateway
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/gateway ./

USER nodeapp
EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
