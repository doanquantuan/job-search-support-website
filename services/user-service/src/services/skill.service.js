import skillRepository from '../repositories/skill.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

class SkillService {

    async getSkillsByUserId(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return skillRepository.findAllByUserId(userId);
    }


    async getSkillsById(skillId) {
        const skill = await skillRepository.findById(skillId);
        if (!skill) {
            throw new NotFoundError('Kỹ năng không tồn tại');
        }
        return skill;
    }



    async updateSkillsByUserId(userId, skills) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        // định dạng action và mảng tên kỹ năng
        const isActionFormat =
            skills.length > 0 &&
            skills.some((item) => item && typeof item === 'object' && 'action' in item);

        if (isActionFormat) {
            for (const item of skills) {
                const { action, skillName, skillId } = item;

                if (action === 'ADD') {
                    const trimmedName = skillName.trim();
                    let skill = await skillRepository.findByName(trimmedName);

                    if (!skill) {
                        skill = await skillRepository.createSkill(trimmedName);
                    }

                    const existingProfileSkill = await skillRepository.findByUserIdAndSkillId(userId, skill.skillId);
                    if (!existingProfileSkill) {
                        await skillRepository.addProfileSkill(userId, skill.skillId);
                    }
                } else if (action === 'REMOVE') {
                    let targetSkillId = skillId;

                    if (!targetSkillId && skillName) {
                        const skill = await skillRepository.findByName(skillName.trim());
                        if (skill) {
                            targetSkillId = skill.skillId;
                        }
                    }

                    if (targetSkillId) {
                        await skillRepository.removeProfileSkill(userId, targetSkillId);
                    }
                }
            }
        } else {
            // Đồng bộ danh sách kỹ năng
            const targetNames = skills
                .map((s) => (typeof s === 'string' ? s : s?.skillName || s?.name || ''))
                .map((s) => s.trim())
                .filter(Boolean);

            // Khử trùng lặp
            const uniqueTargetNames = [];
            const seenLower = new Set();
            for (const name of targetNames) {
                const lower = name.toLowerCase();
                if (!seenLower.has(lower)) {
                    seenLower.add(lower);
                    uniqueTargetNames.push(name);
                }
            }

            // Lấy danh sách kỹ năng hiện tại
            const currentSkills = await skillRepository.findAllByUserId(userId);

            // Xóa các kỹ năng trong DB mà không có trong danh sách mới
            for (const curr of currentSkills) {
                if (!seenLower.has(curr.skillName.toLowerCase())) {
                    await skillRepository.removeProfileSkill(userId, curr.skillId);
                }
            }

            // Thêm các kỹ năng trong danh sách mới mà user chưa có
            const currentLowerSet = new Set(currentSkills.map((c) => c.skillName.toLowerCase()));
            for (const name of uniqueTargetNames) {
                if (!currentLowerSet.has(name.toLowerCase())) {
                    let skill = await skillRepository.findByName(name);
                    if (!skill) {
                        skill = await skillRepository.createSkill(name);
                    }

                    const existing = await skillRepository.findByUserIdAndSkillId(userId, skill.skillId);
                    if (!existing) {
                        await skillRepository.addProfileSkill(userId, skill.skillId);
                    }
                }
            }
        }

        return skillRepository.findAllByUserId(userId);
    }


}

export default new SkillService();
