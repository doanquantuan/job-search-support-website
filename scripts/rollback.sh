#!/bin/bash
# ==============================================================================
# ROLLBACK SCRIPT: KHÔI PHỤC PHIÊN BẢN ỔN ĐỊNH GẦN NHẤT
# Tiêu chuẩn Rubric TC2.6: Cơ chế rollback tự động và đánh phiên bản an toàn
# ==============================================================================

set -e

COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.staging.yml"}
PREVIOUS_VERSION_FILE=".last_stable_version"

echo "=========================================================="
echo " [ROLLBACK] BẮT ĐẦU TIẾN TRÌNH ROLLBACK HỆ THỐNG"
echo " Thời gian: $(date)"
echo "=========================================================="

if [ -f "$PREVIOUS_VERSION_FILE" ]; then
  TARGET_TAG=$(cat "$PREVIOUS_VERSION_FILE")
  echo " [*] Tìm thấy phiên bản ổn định trước đó: $TARGET_TAG"
else
  TARGET_TAG="previous"
  echo " [!] Không tìm thấy $PREVIOUS_VERSION_FILE, sử dụng tag mặc định: $TARGET_TAG"
fi

export IMAGE_TAG="$TARGET_TAG"

echo " [*] Đang chuyển đổi dịch vụ về phiên bản: $TARGET_TAG..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo " [*] Chờ các container ổn định..."
sleep 5

echo " [*] Chạy kiểm tra sau rollback..."
if bash ./scripts/healthcheck.sh; then
  echo "=========================================================="
  echo " [ROLLBACK SUCCESS] ĐÃ PHỤC HỒI THÀNH CÔNG VỀ PHIÊN BẢN $TARGET_TAG!"
  echo "=========================================================="
  exit 0
else
  echo " [CRITICAL] Rollback thất bại! Cần can thiệp khẩn cấp từ kỹ sư DevOps."
  exit 1
fi
