import skillRepository from '../repositories/skill.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { BadRequestError, NotFoundError } from '#shared/utils/errors.util.js';

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

        return skillRepository.findAllByUserId(userId);

    }


}

export default new SkillService();
