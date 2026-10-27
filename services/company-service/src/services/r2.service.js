import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import config from '../config/env.config.js';

// S3 Client - tương thích Cloudflare R2 (region: 'auto')
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.CLOUDFLARE_R2.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.CLOUDFLARE_R2.ACCESS_KEY_ID,
    secretAccessKey: config.CLOUDFLARE_R2.SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const PUBLIC_BUCKET = config.CLOUDFLARE_R2.PUBLIC_BUCKET;
const PRIVATE_BUCKET = config.CLOUDFLARE_R2.PRIVATE_BUCKET;
const PUBLIC_URL = (config.CLOUDFLARE_R2.PUBLIC_URL || '').replace(/\/$/, '');

// Helper: Kiểm tra URL/Key có thuộc R2 bucket không
function extractKeyFromPublicUrl(fileUrl) {
  if (!fileUrl) return null;
  if (!fileUrl.startsWith(PUBLIC_URL)) return null;
  return fileUrl.replace(`${PUBLIC_URL}/`, '');
}

function isValidPrivateKey(key) {
  if (!key) return false;
  return key.startsWith('licenses/');
}

// Upload lên Public Bucket

/**
 * Upload một file lên Public Bucket
 *
 * @param {{ buffer: Buffer, folder: string, prefix: string, ext: string, mime: string }} param
 * @returns {Promise<string>} 
 */
async function uploadPublicFile({ buffer, folder, prefix, ext, mime }) {
  const key = `${folder}/${prefix}-${Date.now()}-${randomUUID()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mime,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Upload nhiều file ảnh lên Public Bucket 
 *
 * @param {Array<{ buffer: Buffer, ext: string, mime: string }>} files
 * @param {{ folder: string, prefix: string }} options
 * @returns {Promise<string[]>} 
 */
async function uploadPublicMultipleFiles(files, { folder, prefix }) {
  const uploadedKeys = [];

  const results = await Promise.allSettled(
    files.map(async (file) => {
      const key = `${folder}/${prefix}-${Date.now()}-${randomUUID()}.${file.ext}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: PUBLIC_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mime,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      uploadedKeys.push(key);
      return `${PUBLIC_URL}/${key}`;
    })
  );

  const failed = results.filter((r) => r.status === 'rejected');

  if (failed.length > 0) {
    // Rollback: 
    await Promise.allSettled(
      uploadedKeys.map((key) =>
        s3Client.send(new DeleteObjectCommand({ Bucket: PUBLIC_BUCKET, Key: key }))
      )
    );
    const firstError = failed[0].reason;
    throw new Error(
      `Upload ảnh thất bại (${failed.length}/${files.length} lỗi). Đã rollback toàn bộ. ` +
      (firstError?.message || '')
    );
  }

  return results.map((r) => r.value);
}

/**
 * Xóa một file khỏi Public Bucket 
 *
 * @param {string} fileUrl 
 */
async function deletePublicFile(fileUrl) {
  const key = extractKeyFromPublicUrl(fileUrl);
  if (!key) {
    return;
  }
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: PUBLIC_BUCKET, Key: key }));
  } catch (err) {
    console.warn(`[R2] Cảnh báo: Không thể xóa file public "${key}":`, err.message);
  }
}

// Upload lên Private Bucket

/**
 * Upload giấy phép kinh doanh lên Private Bucket
 *
 * @param {{ buffer: Buffer, prefix: string, ext: string, mime: string }} param
 * @returns {Promise<string>} 
 */
async function uploadPrivateLicense({ buffer, ext, mime }) {
  const key = `licenses/license-${Date.now()}-${randomUUID()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: PRIVATE_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mime,
    })
  );

  return key;
}

/**
 * Tạo Presigned GET URL ngắn hạn cho giấy phép kinh doanh 
 *
 * @param {string} licenseKey 
 * @returns {Promise<string>} 
 */
async function getLicensePresignedUrl(licenseKey) {
  if (!isValidPrivateKey(licenseKey)) {
    throw new Error(`Key giấy phép không hợp lệ: "${licenseKey}"`);
  }

  const command = new GetObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: licenseKey,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: config.CLOUDFLARE_R2.PRESIGNED_EXPIRES_IN,
  });
}

/**
 * Xóa giấy phép cũ khỏi Private Bucket 
 *
 * @param {string} licenseKey 
 */
async function deletePrivateLicense(licenseKey) {
  if (!isValidPrivateKey(licenseKey)) {
    return;
  }
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: licenseKey }));
  } catch (err) {
    console.warn(`[R2] Cảnh báo: Không thể xóa license "${licenseKey}":`, err.message);
  }
}

export {
  uploadPublicFile,
  uploadPublicMultipleFiles,
  deletePublicFile,
  uploadPrivateLicense,
  getLicensePresignedUrl,
  deletePrivateLicense,
};
