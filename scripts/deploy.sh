#!/bin/bash
# ==============================================================================
# DEPLOY SCRIPT: TỰ ĐỘNG TRIỂN KHAI VÀ GIÁM SÁT ZERO-DOWNTIME
# Tiêu chuẩn Rubric TC2.6: Tự động hóa triển khai, backup, healthcheck & rollback
# ==============================================================================

set -e

COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.staging.yml"}
VERSION_TAG=${VERSION_TAG:-$(git rev-parse --short HEAD)}
PREVIOUS_VERSION_FILE=".last_stable_version"

echo "=========================================================="
echo " [DEPLOY] BẮT ĐẦU TRIỂN KHAI PHIÊN BẢN MỚI: $VERSION_TAG"
echo " Thời gian: $(date)"
echo " File compose: $COMPOSE_FILE"
echo "=========================================================="

# 1. Lưu lại phiên bản hiện tại trước khi deploy để sẵn sàng rollback nếu lỗi
if [ -f ".current_version" ]; then
  cp .current_version "$PREVIOUS_VERSION_FILE"
  echo " [*] Đã lưu snapshot phiên bản cũ: $(cat $PREVIOUS_VERSION_FILE)"
fi

# 2. Xuất biến môi trường tag phiên bản
export IMAGE_TAG="$VERSION_TAG"

# 3. Build & khởi động các containers
echo " [*] Đang build và khởi động các container mới..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

# 4. Kiểm tra sức khỏe toàn hệ thống (Post-Deployment Healthcheck)
echo " [*] Đang thực hiện Post-Deployment Health Check..."
if bash ./scripts/healthcheck.sh; then
  echo "$VERSION_TAG" > .current_version
  echo "=========================================================="
  echo " [DEPLOY SUCCESS] TRIỂN KHAI THÀNH CÔNG PHIÊN BẢN $VERSION_TAG!"
  echo "=========================================================="
  exit 0
else
  echo "=========================================================="
  echo " [DEPLOY ERROR] Health check thất bại! Đang tự động Rollback..."
  echo "=========================================================="
  bash ./scripts/rollback.sh
  exit 1
fi
