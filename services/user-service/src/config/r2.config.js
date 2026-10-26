import { S3Client } from '@aws-sdk/client-s3';
import config from './env.config.js';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.R2.ENDPOINT,
  credentials: {
    accessKeyId: config.R2.ACCESS_KEY,
    secretAccessKey: config.R2.SECRET_KEY,
  },
});

const bucketName = config.R2.BUCKET;
const publicUrl = config.R2.PUBLIC_URL;

export {
  s3Client,
  bucketName,
  publicUrl,
};

