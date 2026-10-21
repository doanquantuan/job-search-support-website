import app from './src/app.js';
import config from './src/config/env.config.js';

const PORT = config.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Job Service running on port ${PORT}`);
});

