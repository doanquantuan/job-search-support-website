import app from './src/app.js';
import config from './src/config/env.config.js';
import companyMessageBroker from './src/rabbitmq/companyConsumer.js';
import { pingElasticsearch } from './src/config/elasticsearch.js';
import { ensureIndex } from './src/search/jobIndex.js';

const PORT = config.PORT || 5003;

app.listen(PORT, async () => {
  console.log(`Job Service running on port ${PORT}`);

  try {
    await companyMessageBroker.initConsumer();
  } catch (error) {
    console.error('[RabbitMQ] Khởi động RabbitMQ response consumer thất bại:', error.message);
  }

  // Khởi tạo kết nối Elasticsearch và tạo index (nếu chưa có)
  try {
    const isAlive = await pingElasticsearch();
    if (isAlive) {
      await ensureIndex();
    }
  } catch (error) {
    console.warn('[Elasticsearch] Khởi tạo thất bại, hệ thống sẽ fallback sang PostgreSQL:', error.message);
  }
});
