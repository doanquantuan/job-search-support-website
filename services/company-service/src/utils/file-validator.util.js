const { BadRequestError } = require('./errors.util');

const MIME_TO_EXT = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Validate tệp bằng magic bytes
 *
 * @param {Buffer} buffer 
 * @param {string[]} allowedMimes 
 * @returns {Promise<{ ext: string, mime: string }>} 
 * @throws {BadRequestError} 
 */
async function validateAndExtractFileType(buffer, allowedMimes) {
  const { fileTypeFromBuffer } = await import('file-type');

  const result = await fileTypeFromBuffer(buffer);

  if (!result) {
    throw new BadRequestError(
      'Không thể xác định định dạng tệp. Vui lòng kiểm tra lại tệp tải lên.'
    );
  }

  if (!allowedMimes.includes(result.mime)) {
    const allowedExts = allowedMimes
      .map((m) => MIME_TO_EXT[m] || m)
      .join(', ')
      .toUpperCase();
    throw new BadRequestError(
      `Tệp tải lên có định dạng "${result.mime}" không được hỗ trợ. Chỉ chấp nhận: ${allowedExts}.`
    );
  }

  const ext = MIME_TO_EXT[result.mime];
  if (!ext) {
    throw new BadRequestError(`Không xác định được đuôi file cho định dạng "${result.mime}".`);
  }

  return { ext, mime: result.mime };
}

// các tập hợp MIME
const ALLOWED_LICENSE_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

module.exports = {
  validateAndExtractFileType,
  ALLOWED_LICENSE_MIMES,
  ALLOWED_IMAGE_MIMES,
};
