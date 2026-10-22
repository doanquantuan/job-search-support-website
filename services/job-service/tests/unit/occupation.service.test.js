import { jest } from '@jest/globals';

const mockOccupationRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockSpecializationRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByNameAndOccupation: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.unstable_mockModule('../../src/repositories/occupation.repository.js', () => ({
  default: mockOccupationRepository,
}));

jest.unstable_mockModule('../../src/repositories/specialization.repository.js', () => ({
  default: mockSpecializationRepository,
}));

const { default: occupationService } = await import('../../src/services/occupation.service.js');

describe('OccupationService Unit Tests', () => {
  const occId = 'occ-uuid-1';
  const specId = 'spec-uuid-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Occupation Operations', () => {
    it('getAllOccupations should return list', async () => {
      mockOccupationRepository.findAll.mockResolvedValue([{ occupationId: occId, occupationName: 'IT' }]);
      const res = await occupationService.getAllOccupations();
      expect(res).toHaveLength(1);
      expect(res[0].occupationName).toBe('IT');
    });

    it('createOccupation should fail if name already exists', async () => {
      mockOccupationRepository.findByName.mockResolvedValue({ occupationId: occId, occupationName: 'IT' });
      await expect(occupationService.createOccupation('IT')).rejects.toThrow('Ngành nghề này đã tồn tại');
    });

    it('createOccupation should create when name is new', async () => {
      mockOccupationRepository.findByName.mockResolvedValue(null);
      mockOccupationRepository.create.mockResolvedValue({ occupationId: occId, occupationName: 'IT' });
      const res = await occupationService.createOccupation('IT');
      expect(res.occupationName).toBe('IT');
    });

    it('deleteOccupation should reject if occupation has specializations', async () => {
      mockOccupationRepository.findById.mockResolvedValue({
        occupationId: occId,
        specializations: [{ specializationId: specId }],
      });

      await expect(occupationService.deleteOccupation(occId)).rejects.toThrow('Không thể xóa ngành nghề đang chứa các chuyên ngành');
    });
  });

  describe('Specialization Operations', () => {
    it('createSpecialization should create successfully', async () => {
      mockOccupationRepository.findById.mockResolvedValue({ occupationId: occId });
      mockSpecializationRepository.findByNameAndOccupation.mockResolvedValue(null);
      mockSpecializationRepository.create.mockResolvedValue({
        specializationId: specId,
        specializationName: 'Node.js',
        occupationId: occId,
      });

      const res = await occupationService.createSpecialization(occId, 'Node.js');
      expect(res.specializationName).toBe('Node.js');
    });

    it('createSpecialization should reject if duplicate within occupation', async () => {
      mockOccupationRepository.findById.mockResolvedValue({ occupationId: occId });
      mockSpecializationRepository.findByNameAndOccupation.mockResolvedValue({ specializationId: specId });

      await expect(occupationService.createSpecialization(occId, 'Node.js')).rejects.toThrow('Chuyên ngành này đã tồn tại');
    });
  });
});

