import app from './src/app.js';
import config from './src/config/env.config.js';
import companyMessageBroker from './src/rabbitmq/companyConsumer.js';

const PORT = config.PORT || 5003;

app.listen(PORT, async () => {
  console.log(`Job Service running on port ${PORT}`);

  try {
    await companyMessageBroker.initConsumer();
  } catch (error) {
    console.error('[RabbitMQ] Khởi động RabbitMQ response consumer thất bại:', error.message);
  }
});
