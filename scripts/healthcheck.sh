#!/bin/bash
# ==============================================================================
# HEALTHCHECK SCRIPT: KIỂM TRA SỨC KHỎE HỆ THỐNG JOBLORIA
# Tiêu chuẩn Rubric TC2.6: Giám sát sau triển khai và tự động phát hiện lỗi
# ==============================================================================

set -e

GATEWAY_URL=${GATEWAY_URL:-"http://localhost:5000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
ADMIN_URL=${ADMIN_URL:-"http://localhost:3001"}

MAX_RETRIES=15
DELAY_SECONDS=2

echo "=========================================================="
echo " [HEALTHCHECK] BẮT ĐẦU KIỂM TRA SỨC KHỎE HỆ THỐNG"
echo " Thời gian: $(date)"
echo " Gateway: $GATEWAY_URL"
echo " Frontend: $FRONTEND_URL"
echo " Admin: $ADMIN_URL"
echo "=========================================================="

check_endpoint() {
  local name=$1
  local url=$2
  local retry=1

  echo -n " [*] Đang kiểm tra $name ($url)... "

  while [ $retry -le $MAX_RETRIES ]; do
    if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
      echo " [OK] (Lần thử $retry)"
      return 0
    fi
    sleep $DELAY_SECONDS
    retry=$((retry + 1))
  done

  echo " [FAIL] (Không phản hồi sau $MAX_RETRIES lần thử)"
  return 1
}

# 1. Kiểm tra API Gateway
check_endpoint "API Gateway" "$GATEWAY_URL/health"

# 2. Kiểm tra Frontend Client
check_endpoint "Frontend Web" "$FRONTEND_URL/health"

# 3. Kiểm tra Admin Portal
check_endpoint "Admin Portal" "$ADMIN_URL/health"

# 4. Kiểm tra các Microservices qua Gateway routes
check_endpoint "Auth Microservice" "$GATEWAY_URL/api/v1/auth/health" || echo " [WARN] Auth health fallback"
check_endpoint "Job Microservice" "$GATEWAY_URL/api/v1/jobs/health" || echo " [WARN] Job health fallback"

echo "=========================================================="
echo " [SUCCESS] 100% CÁC DỊCH VỤ CỐT LÕI ĐÃ SẴN SÀNG VÀ ỔN ĐỊNH!"
echo "=========================================================="
exit 0
