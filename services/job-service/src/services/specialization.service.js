import specializationRepository from '../repositories/specialization.repository.js';
import { NotFoundError, ConflictError } from '#shares/utils/errors.util.js';
class Specialization {
  async getAllSpecializations(occupationId = null) {
    if (occupationId) {
      await this.getOccupationById(occupationId);
    }
    return await specializationRepository.findAll(occupationId);
  }

  async getSpecializationById(specializationId) {
    const specialization = await specializationRepository.findById(specializationId);
    if (!specialization) {
      throw new NotFoundError('Không tìm thấy chuyên ngành');
    }
    return specialization;
  }

  async createSpecialization(occupationId, specializationName) {
    await this.getOccupationById(occupationId);

    const trimmedName = specializationName.trim();
    const existing = await specializationRepository.findByNameAndOccupation(occupationId, trimmedName);
    if (existing) {
      throw new ConflictError('Chuyên ngành này đã tồn tại trong ngành nghề đã chọn');
    }

    return await specializationRepository.create({
      occupationId,
      specializationName: trimmedName,
    });
  }

  async updateSpecialization(specializationId, { specializationName, occupationId }) {
    const current = await this.getSpecializationById(specializationId);

    const targetOccupationId = occupationId || current.occupationId;
    const targetName = specializationName ? specializationName.trim() : current.specializationName;

    if (occupationId) {
      await this.getOccupationById(occupationId);
    }

    const existing = await specializationRepository.findByNameAndOccupation(targetOccupationId, targetName);
    if (existing && existing.specializationId !== specializationId) {
      throw new ConflictError('Tên chuyên ngành đã tồn tại trong ngành nghề này');
    }

    return await specializationRepository.update(specializationId, {
      occupationId: targetOccupationId,
      specializationName: targetName,
    });
  }

  async deleteSpecialization(specializationId) {
    await this.getSpecializationById(specializationId);
    return await specializationRepository.delete(specializationId);
  }
}

export default new Specialization();
