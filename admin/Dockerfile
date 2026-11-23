# ==========================================
# Multi-stage Dockerfile: Admin Portal (SPA)
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY admin/package*.json ./
RUN npm ci

COPY admin/ ./
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:5000/api/v1}

RUN npm run build

# ==========================================
# Production Web Server (Nginx Alpine)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
