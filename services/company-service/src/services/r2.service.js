import fileService from './file.service.js';

export const uploadPrivateLicense = async ({ buffer, ext = 'pdf', mime = 'application/pdf' }) => {
  const result = await fileService.uploadDocument({
    buffer,
    originalname: `license.${ext}`,
    mimetype: mime,
    subfolder: 'licenses',
  });
  return result?.fileUrl || `licenses/license-${Date.now()}.${ext}`;
};

export const getLicensePresignedUrl = async (key, expiresIn = 3600) => {
  return await fileService.getPresignedUrl(key, expiresIn);
};

export const deletePrivateLicense = async (key) => {
  return await fileService.deleteFile(key);
};

export const uploadPublicFile = async ({ buffer, folder = 'logos', prefix = 'file', ext = 'png', mime = 'image/png' }) => {
  const result = await fileService.uploadProcessedImage(buffer, `.${ext}`, mime, folder);
  return result?.url || `https://pub-mock.r2.dev/${folder}/${prefix}-${Date.now()}.${ext}`;
};

export const deletePublicFile = async (url) => {
  return await fileService.deleteFile(url);
};

export default {
  uploadPrivateLicense,
  getLicensePresignedUrl,
  deletePrivateLicense,
  uploadPublicFile,
  deletePublicFile,
};

