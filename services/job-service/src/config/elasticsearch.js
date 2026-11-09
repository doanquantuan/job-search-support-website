import { Client } from '@elastic/elasticsearch';
import config from './env.config.js';

const client = new Client({
  node: config.ELASTICSEARCH_NODE,
  requestTimeout: 10000,
  pingTimeout: 3000,
});

/**
 * Ping Elasticsearch để kiểm tra kết nối.
 * @returns {Promise<boolean>}
 */
export async function pingElasticsearch() {
  try {
    await client.ping();
    console.log('[Elasticsearch] Kết nối thành công tới', config.ELASTICSEARCH_NODE);
    return true;
  } catch (err) {
    console.warn('[Elasticsearch] Không thể kết nối:', err.message);
    return false;
  }
}

export default client;
