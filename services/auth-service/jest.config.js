import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^#shared/(.*)$': path.resolve(__dirname, '../../shared/$1').replace(/\\/g, '/'),
  },
};
