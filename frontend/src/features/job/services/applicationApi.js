import { apiClient } from '@/lib/apiClient';

export const applicationApi = {
  /**
   * Ứng viên nộp hồ sơ ứng tuyển vào 1 tin tuyển dụng (UC23)
   * @param {{ jobId: string, cvId?: string, coverLetter?: string }} data
   */
  async applyJob(data) {
    const response = await apiClient.post('/applications/apply', data);
    return response.data?.data || response.data;
  },

  /**
   * Kiểm tra xem ứng viên hiện tại đã nộp đơn vào job này chưa
   * @param {string} jobId
   */
  async checkJobApplied(jobId) {
    if (!jobId) return { hasApplied: false };
    try {
      const response = await apiClient.get(`/applications/check/${jobId}`);
      return response.data?.data || response.data || { hasApplied: false };
    } catch (err) {
      console.warn(`[applicationApi] checkJobApplied(${jobId}) thất bại:`, err?.response?.data || err.message);
      return { hasApplied: false };
    }
  },

  /**
   * Ứng viên xem danh sách các đơn đã nộp (UC24)
   * @param {{ status?: string, page?: number, limit?: number }} params
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
    try {
      const response = await apiClient.get(`/applications/${id}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[applicationApi] Lỗi getApplicationDetail(${id}):`, err.message);
      return null;
    }
  },

  /**
   * Ứng viên rút đơn ứng tuyển
   * @param {string} id
   * @param {string} [note]
   */
  async withdrawApplication(id, note = 'Ứng viên chủ động rút đơn') {
    const response = await apiClient.patch(`/applications/${id}/withdraw`, { note });
    return response.data?.data || response.data;
  },

  /**
   * Ứng viên gửi lời nhắc nhở NTD xem hồ sơ (có cooldown 24h)
   * @param {string} id
   */
  async remindRecruiter(id) {
    const response = await apiClient.post(`/applications/${id}/remind`);
    return response.data?.data || response.data;
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ── PHÂN HỆ NHÀ TUYỂN DỤNG (RECRUITER ATS METHODS - UC38, UC39, UC40, UC41) ─
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách hồ sơ ứng viên theo tin tuyển dụng (UC38, UC39)
   * @param {string} jobId
   * @param {{ status?: string, page?: number, limit?: number, search?: string }} params
   */
  async getJobApplications(jobId, params = {}) {
    if (!jobId || jobId === 'all') {
      return this.getAllRecruiterApplications(params);
    }
    const response = await apiClient.get(`/applications/jobs/${jobId}`, { params });
    return response.data?.data || response.data;
  },

  /**
   * Lấy toàn bộ ứng viên của tất cả các tin tuyển dụng thuộc công ty
   */
  async getAllRecruiterApplications(params = {}) {
    const response = await apiClient.get('/applications/recruiter/all', { params });
    return response.data?.data || response.data;
  },

  /**
   * Lấy dữ liệu báo cáo & thống kê tuyển dụng theo mốc thời gian (Recruiter Analytics)
   * @param {{ timeRange?: '7d' | '30d' | 'quarter' | 'year', jobId?: string }} params
   */
  async getRecruiterAnalytics({ timeRange = '7d', jobId = null } = {}) {
    try {
      const params = { timeRange };
      if (jobId && jobId !== 'all') params.jobId = jobId;
      const response = await apiClient.get('/applications/recruiter/analytics', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.error('[applicationApi] Lỗi getRecruiterAnalytics:', err.response?.status, err.response?.data || err.message);
      return null;
    }
  },

  /**
   * Nhà tuyển dụng cập nhật trạng thái vòng tuyển dụng và ghi chú đánh giá (UC40, UC41)
   * @param {string} applicationId
   * @param {{ status: string, note?: string, interviewDetails?: object }} data
   */
  async updateApplicationStatus(applicationId, data) {
    const response = await apiClient.patch(`/applications/${applicationId}/status`, data);
    return response.data?.data || response.data;
  },
};

export default applicationApi;
