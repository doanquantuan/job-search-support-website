# ==========================================
# Multi-stage Dockerfile: Company Service
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY shared/package*.json ./shared/
RUN npm ci --prefix shared

COPY services/company-service/package*.json ./services/company-service/
RUN cd services/company-service && npm ci

COPY shared/ ./shared/
COPY services/company-service/ ./services/company-service/
RUN cd services/company-service && npm run db:generate --if-present

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapp

COPY --from=builder --chown=nodeapp:nodejs /app/shared ./shared
COPY --from=builder --chown=nodeapp:nodejs /app/services/company-service ./services/company-service

USER nodeapp
WORKDIR /app/services/company-service
EXPOSE 5004

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5004/health || exit 1

CMD ["node", "server.js"]
