/**
 * Script: Bulk Sync tất cả JobPost từ PostgreSQL sang Elasticsearch.
 *
 * Chạy: node scripts/reindex.js
 *
 * Dùng khi:
 *  - Khởi tạo lần đầu (Elasticsearch vừa được setup)
 *  - Elasticsearch bị mất dữ liệu (restart, crash)
 *  - Schema mapping thay đổi (cần xóa index cũ và tạo lại)
 */

import '../src/config/env.config.js'; // Load .env
import prisma from '../src/config/prisma.js';
import { ensureIndex, bulkIndexJobs } from '../src/search/jobIndex.js';
import { pingElasticsearch } from '../src/config/elasticsearch.js';

const BATCH_SIZE = 100;

async function reindex() {
  console.log('🔄 Bắt đầu re-index JobPosts sang Elasticsearch...\n');

  // 1. Kiểm tra kết nối Elasticsearch
  const isAlive = await pingElasticsearch();
  if (!isAlive) {
    console.error('❌ Không thể kết nối tới Elasticsearch. Dừng re-index.');
    process.exit(1);
  }

  // 2. Tạo index (nếu chưa có)
  await ensureIndex();

  // 3. Đếm tổng số job posts
  const total = await prisma.jobPost.count();
  console.log(`📊 Tổng số JobPost trong DB: ${total}\n`);

  if (total === 0) {
    console.log('⚠️  Không có JobPost nào để index.');
    await prisma.$disconnect();
    return;
  }

  // 4. Lấy và index theo batch
  let indexed = 0;
  let errors = 0;
  let skip = 0;

  while (skip < total) {
    const jobs = await prisma.jobPost.findMany({
      skip,
      take: BATCH_SIZE,
      include: {
        jobPostSpecializations: {
          include: {
            specialization: {
              include: {
                occupation: true,
              },
            },
          },
        },
      },
    });

    if (jobs.length === 0) break;

    const items = jobs.map((job) => ({ job, companyInfo: null }));
    const result = await bulkIndexJobs(items);
    indexed += result.success;
    errors += result.errors;

    console.log(`✅ Đã xử lý ${Math.min(skip + BATCH_SIZE, total)}/${total} jobs...`);
    skip += BATCH_SIZE;
  }

  console.log('\n──────────────────────────────────────');
  console.log(`✅ Re-index hoàn tất:`);
  console.log(`   Thành công : ${indexed}`);
  console.log(`   Lỗi        : ${errors}`);
  console.log('──────────────────────────────────────');

  await prisma.$disconnect();
}

reindex().catch((err) => {
  console.error('❌ Re-index thất bại:', err.message);
  process.exit(1);
});
