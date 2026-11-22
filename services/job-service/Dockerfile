# ==========================================
# Multi-stage Dockerfile: Job Service
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY shared/package*.json ./shared/
RUN npm ci --prefix shared

COPY services/job-service/package*.json ./services/job-service/
RUN cd services/job-service && npm ci

COPY shared/ ./shared/
COPY services/job-service/ ./services/job-service/
RUN cd services/job-service && npm run db:generate --if-present

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/shared ./shared
COPY --from=builder --chown=nodeapp:nodejs /app/services/job-service ./services/job-service

USER nodeapp
WORKDIR /app/services/job-service
EXPOSE 5003

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5003/health || exit 1

CMD ["node", "server.js"]
