import app from './src/app.js';
import config from './src/config/env.config.js';
import prisma from './src/config/prisma.js';
import companyMessageBroker from './src/rabbitmq/companyConsumer.js';
import jobRequestConsumer from './src/rabbitmq/jobRequestConsumer.js';
import { pingElasticsearch } from './src/config/elasticsearch.js';
import { ensureIndex, getIndexedJobCount, bulkIndexJobs } from './src/search/jobIndex.js';

const PORT = config.PORT || 5003;
const SYNC_BATCH_SIZE = 100;

async function syncJobsIfIndexEmpty() {
  const esCount = await getIndexedJobCount();
  if (esCount > 0) return;

  const dbCount = await prisma.jobPost.count();
  if (dbCount === 0) return;

  console.log(`[Elasticsearch] Index "${config.ELASTICSEARCH_INDEX}" đang rỗng (0/${dbCount} jobs), đang tự động đồng bộ từ PostgreSQL...`);

  let indexed = 0;
  let errors = 0;
  let skip = 0;

  while (skip < dbCount) {
    const jobs = await prisma.jobPost.findMany({
      skip,
      take: SYNC_BATCH_SIZE,
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
    skip += SYNC_BATCH_SIZE;
  }

  console.log(`[Elasticsearch] Tự động đồng bộ hoàn tất: ${indexed} thành công, ${errors} lỗi.`);
}

app.listen(PORT, async () => {
  console.log(`Job Service running on port ${PORT}`);

  try {
    await companyMessageBroker.initConsumer();
    await jobRequestConsumer.start();
  } catch (error) {
    console.error('[RabbitMQ] Khởi động RabbitMQ consumers thất bại:', error.message);
  }

  // Khởi tạo kết nối Elasticsearch, tạo index và tự động đồng bộ nếu index rỗng
  try {
    const isAlive = await pingElasticsearch();
    if (isAlive) {
      await ensureIndex();
      await syncJobsIfIndexEmpty();
    }
  } catch (error) {
    console.warn('[Elasticsearch] Khởi tạo thất bại, hệ thống sẽ fallback sang PostgreSQL:', error.message);
  }
});
