import { apiClient } from '@/lib/apiClient';

export const applicationApi = {
  /**
   * Ứng viên nộp hồ sơ ứng tuyển
   * @param {{ jobId: string, cvId?: string, coverLetter?: string, jobTitle?: string }} data
   */
  async applyJob(data) {
    const response = await apiClient.post('/applications/apply', data);
    return response.data?.data || response.data;
  },

  /**
   * Ứng viên xem danh sách các đơn đã nộp
   * @param {{ page?: number, limit?: number, status?: string }} params
   */
  async getMyApplications(params = {}) {
    const response = await apiClient.get('/applications/me', { params });
    return response.data?.data || response.data;
  },

  /**
   * Xem chi tiết 1 đơn ứng tuyển
   * @param {string} id
   */
  async getApplicationDetail(id) {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data?.data || response.data;
  },

  /**
   * Ứng viên rút đơn ứng tuyển
   * @param {string} id
   */
  async withdrawApplication(id) {
    const response = await apiClient.patch(`/applications/${id}/withdraw`);
    return response.data?.data || response.data;
  },
};

export default applicationApi;

