// Unit tests for SkillService
// Language: Vietnamese
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/skill.repository.js', () => ({
  default: {
    findAllByUserId: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    createSkill: jest.fn(),
    findByUserIdAndSkillId: jest.fn(),
    addProfileSkill: jest.fn(),
    removeProfileSkill: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/repositories/profile.repository.js', () => ({
  default: {
    findByUserId: jest.fn(),
  },
}));

let SkillService;
let skillRepo;
let profileRepo;

beforeAll(async () => {
  const skillRepoMod = await import('../../src/repositories/skill.repository.js');
  skillRepo = skillRepoMod.default;
  const profileRepoMod = await import('../../src/repositories/profile.repository.js');
  profileRepo = profileRepoMod.default;
  const skillServiceImport = await import('../../src/services/skill.service.js');
  SkillService = skillServiceImport.default;
});

describe('SkillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getSkillsByUserId trả về danh sách skill khi profile tồn tại', async () => {
    profileRepo.findByUserId.mockResolvedValue({ userId: 'u1' });
    const fakeSkills = [{ skillId: 's1' }, { skillId: 's2' }];
    skillRepo.findAllByUserId.mockResolvedValue(fakeSkills);

    const result = await SkillService.getSkillsByUserId('u1');
    expect(profileRepo.findByUserId).toHaveBeenCalledWith('u1');
    expect(skillRepo.findAllByUserId).toHaveBeenCalledWith('u1');
    expect(result).toBe(fakeSkills);
  });

  test('getSkillsByUserId khi profile không tồn tại ném NotFoundError', async () => {
    profileRepo.findByUserId.mockResolvedValue(null);
    await expect(SkillService.getSkillsByUserId('u2')).rejects.toThrow();
  });

  test('getSkillsById trả về skill khi tồn tại', async () => {
    const skill = { skillId: 's1', name: 'JS' };
    skillRepo.findById.mockResolvedValue(skill);
    const result = await SkillService.getSkillsById('s1');
    expect(skillRepo.findById).toHaveBeenCalledWith('s1');
    expect(result).toBe(skill);
  });

  test('getSkillsById khi không tìm thấy ném NotFoundError', async () => {
    skillRepo.findById.mockResolvedValue(null);
    await expect(SkillService.getSkillsById('s2')).rejects.toThrow();
  });

  test('updateSkillsByUserId thêm skill mới và trả về danh sách cập nhật', async () => {
    profileRepo.findByUserId.mockResolvedValue({ userId: 'u3' });
    const skill = { skillId: 'sNew', name: 'Node' };
    skillRepo.findByName.mockResolvedValue(null);
    skillRepo.createSkill.mockResolvedValue(skill);
    skillRepo.findByUserIdAndSkillId.mockResolvedValue(null);
    skillRepo.addProfileSkill.mockResolvedValue(undefined);
    skillRepo.findAllByUserId.mockResolvedValue([skill]);

    const actions = [{ action: 'ADD', skillName: 'Node' }];
    const result = await SkillService.updateSkillsByUserId('u3', actions);
    expect(skillRepo.findByName).toHaveBeenCalledWith('Node');
    expect(skillRepo.createSkill).toHaveBeenCalledWith('Node');
    expect(skillRepo.addProfileSkill).toHaveBeenCalledWith('u3', skill.skillId);
    expect(result).toEqual([skill]);
  });

  test('updateSkillsByUserId loại bỏ skill tồn tại', async () => {
    profileRepo.findByUserId.mockResolvedValue({ userId: 'u4' });
    skillRepo.removeProfileSkill.mockResolvedValue(undefined);
    const actions = [{ action: 'REMOVE', skillId: 'sDel' }];
    const result = await SkillService.updateSkillsByUserId('u4', actions);
    expect(skillRepo.removeProfileSkill).toHaveBeenCalledWith('u4', 'sDel');
    // final list fetched
    expect(skillRepo.findAllByUserId).toHaveBeenCalledWith('u4');
    expect(result).toBeDefined();
  });
});

