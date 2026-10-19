const { S3Client } = require('@aws-sdk/client-s3');
const config = require('./env.config');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.R2.ENDPOINT,
  credentials: {
    accessKeyId: config.R2.ACCESS_KEY,
    secretAccessKey: config.R2.SECRET_KEY,
  },
});

module.exports = {
  s3Client,
  bucketName: config.R2.BUCKET,
  publicUrl: config.R2.PUBLIC_URL,
};

