const { Worker } = require('bullmq');
const fs = require('fs');
const redis = require('../config/redis');
const fileService = require('../services/file.service');
const profileRepository = require('../repositories/profile.repository');

let uploadWorkerInstance = null;

const createUploadWorker = () => {
  if (uploadWorkerInstance) {
    return uploadWorkerInstance;
  }

  uploadWorkerInstance = new Worker(
    'upload',
    async (job) => {
      const { name, data } = job;
      console.log(`[UploadWorker] Đang xử lý job "${name}" (ID: ${job.id})`);

      switch (name) {
        case 'UPLOAD_AVATAR': {
          const { userId, tempFilePath, originalname, oldAvatar } = data;

          const processStartTime = Date.now();
          let key, url;
          let statsInfo = {};

          try {
            // 1. Tối ưu ảnh với Sharp: Resize vuông 400x400, tự xoay EXIF, nén sang WebP 80% quality
            const sharpStartTime = Date.now();
            const processedImage = await fileService.processAvatarImage(tempFilePath, {
              width: 400,
              height: 400,
              quality: 80,
            });
            const sharpDuration = Date.now() - sharpStartTime;

            const savedRatio = (
              ((processedImage.originalSize - processedImage.size) / processedImage.originalSize) *
              100
            ).toFixed(1);

            console.log(
              `[UploadWorker] Xử lý & nén ảnh thành công bằng Sharp trong ${sharpDuration}ms ` +
              `(${processedImage.originalSize} B -> ${processedImage.size} B, giảm ${savedRatio}%)`
            );

            // 2. Upload ảnh WebP đã tối ưu lên Cloudflare R2
            const uploadStartTime = Date.now();
            const uploadResult = await fileService.uploadProcessedImage(
              processedImage.buffer,
              processedImage.extension,
              processedImage.mimetype,
              'avatars'
            );
            const uploadDuration = Date.now() - uploadStartTime;

            key = uploadResult.key;
            url = uploadResult.url;

            statsInfo = {
              sharpDuration,
              uploadDuration,
              originalSize: processedImage.originalSize,
              optimizedSize: processedImage.size,
              savedRatio: `${savedRatio}%`,
            };
            console.log(`[UploadWorker] Tải ảnh lên R2 hoàn tất trong ${uploadDuration}ms (${(uploadDuration / 1000).toFixed(2)}s)`);
          } finally {
            // Luôn dọn dẹp file tạm trên ổ đĩa sau khi xử lý xong (hoặc có lỗi)
            if (tempFilePath && fs.existsSync(tempFilePath)) {
              try {
                fs.unlinkSync(tempFilePath);
                console.log(`[UploadWorker] Đã dọn dẹp file tạm: ${tempFilePath}`);
              } catch (err) {
                console.warn(`[UploadWorker] Lỗi khi dọn dẹp file tạm (${tempFilePath}):`, err.message);
              }
            }
          }

          const newAvatarUrl = url || key;

          // 3. Cập nhật URL avatar mới vào Database
          await profileRepository.updateInfo({
            userId,
            data: { avatar: newAvatarUrl },
          });

          console.log(`[UploadWorker] Cập nhật avatar thành công cho user ${userId}: ${newAvatarUrl}`);

          // 4. Xóa avatar cũ trên R2 nếu có
          if (oldAvatar && oldAvatar !== newAvatarUrl) {
            try {
              await fileService.deleteFile(oldAvatar);
              console.log(`[UploadWorker] Đã dọn dẹp avatar cũ: ${oldAvatar}`);
            } catch (deleteError) {
              console.warn(`[UploadWorker] Không thể xóa avatar cũ (${oldAvatar}):`, deleteError.message);
            }
          }

          const totalProcessDuration = Date.now() - processStartTime;

          return {
            userId,
            avatar: newAvatarUrl,
            key,
            totalDuration: totalProcessDuration,
            ...statsInfo,
          };
        }

        case 'DELETE_FILE': {
          const { fileUrlOrKey } = data;
          if (fileUrlOrKey) {
            await fileService.deleteFile(fileUrlOrKey);
            console.log(`[UploadWorker] Đã xóa file hoàn tất: ${fileUrlOrKey}`);
          }
          return { deleted: fileUrlOrKey };
        }

        default:
          console.warn(`[UploadWorker] Không nhận diện được job type: ${name}`);
          return null;
      }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  uploadWorkerInstance.on('completed', (job) => {
    const duration = job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0;
    console.log(`[UploadWorker] Job ${job.id} (${job.name}) đã hoàn thành thành công trong ${duration}ms (${(duration / 1000).toFixed(2)}s).`);
  });

  uploadWorkerInstance.on('failed', (job, err) => {
    const duration = job?.finishedOn && job?.processedOn ? job.finishedOn - job.processedOn : 0;
    console.error(`[UploadWorker] Job ${job?.id} (${job?.name}) thất bại sau ${duration}ms:`, err.message);
  });

  return uploadWorkerInstance;
};

// Khởi tạo worker tự động khi file này được import trực tiếp (ví dụ bởi worker.js)
const uploadWorker = createUploadWorker();

module.exports = uploadWorker;
