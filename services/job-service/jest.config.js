import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^#shares/(.*)$': path.resolve(__dirname, '../../shares/$1').replace(/\\/g, '/'),
  },
};

