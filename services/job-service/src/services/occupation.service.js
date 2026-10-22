import occupationRepository from '../repositories/occupation.repository.js';
import specializationRepository from '../repositories/specialization.repository.js';
import { NotFoundError, ConflictError } from '#shares/utils/errors.util.js';

class OccupationService {
  // --- OCCUPATION (Ngành nghề) ---
  async getAllOccupations() {
    return await occupationRepository.findAll();
  }

  async getOccupationById(occupationId) {
    const occupation = await occupationRepository.findById(occupationId);
    if (!occupation) {
      throw new NotFoundError('Không tìm thấy ngành nghề');
    }
    return occupation;
  }

  async createOccupation(occupationName) {
    const trimmedName = occupationName.trim();
    const existing = await occupationRepository.findByName(trimmedName);
    if (existing) {
      throw new ConflictError('Ngành nghề này đã tồn tại');
    }
    return await occupationRepository.create(trimmedName);
  }

  async updateOccupation(occupationId, occupationName) {
    await this.getOccupationById(occupationId);

    const trimmedName = occupationName.trim();
    const existing = await occupationRepository.findByName(trimmedName);
    if (existing && existing.occupationId !== occupationId) {
      throw new ConflictError('Tên ngành nghề đã tồn tại');
    }

    return await occupationRepository.update(occupationId, trimmedName);
  }

  async deleteOccupation(occupationId) {
    const occupation = await this.getOccupationById(occupationId);
    if (occupation.specializations && occupation.specializations.length > 0) {
      throw new ConflictError('Không thể xóa ngành nghề đang chứa các chuyên ngành. Hãy xóa hoặc chuyển chuyên ngành trước.');
    }
    return await occupationRepository.delete(occupationId);
  }

  // --- SPECIALIZATION (Chuyên ngành) ---
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

export default new OccupationService();
