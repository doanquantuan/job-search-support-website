# ==========================================
# Multi-stage Dockerfile: Notification Service
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY shared/package*.json ./shared/
RUN npm ci --prefix shared

COPY services/notification-service/package*.json ./services/notification-service/
RUN cd services/notification-service && npm ci

COPY shared/ ./shared/
COPY services/notification-service/ ./services/notification-service/
RUN cd services/notification-service && npm run db:generate --if-present

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/shared ./shared
COPY --from=builder --chown=nodeapp:nodejs /app/services/notification-service ./services/notification-service

USER nodeapp
WORKDIR /app/services/notification-service
EXPOSE 5007

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5007/health || exit 1

CMD ["node", "src/server.js"]
