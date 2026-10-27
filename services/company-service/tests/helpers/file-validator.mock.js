import { BadRequestError } from '../../src/utils/errors.util.js';

const EXT_TO_MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  txt: 'text/plain',
};

export async function validateAndExtractFileType(buffer, allowedMimes) {
  const ext = buffer._mockExt || 'pdf';
  const mime = EXT_TO_MIME[ext] || 'application/octet-stream';

  if (!allowedMimes.includes(mime)) {
    throw new BadRequestError(
      `Tệp tải lên có định dạng "${mime}" không được hỗ trợ.`
    );
  }

  return { ext: ext === 'jpeg' ? 'jpg' : ext, mime };
}

export const ALLOWED_LICENSE_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

export default {
  validateAndExtractFileType,
  ALLOWED_LICENSE_MIMES,
  ALLOWED_IMAGE_MIMES,
};
