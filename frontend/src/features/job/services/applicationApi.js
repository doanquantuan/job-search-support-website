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
    try {
      const response = await apiClient.get(`/applications/${id}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[applicationApi] Lỗi getApplicationDetail(${id}), dùng mock:`, err.message);
      const found = _MOCK_APPLICATIONS_STORE.find((a) => a.id === id || a.applicationId === id);
      return found || null;
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

  // ────────────────────────────────────────────────────────────────────────────
  // ── PHÂN HỆ NHÀ TUYỂN DỤNG (RECRUITER ATS METHODS - UC38, UC39, UC40, UC41) ─
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách hồ sơ ứng viên theo tin tuyển dụng (UC38, UC39)
   * @param {string} jobId
   * @param {{ status?: string, page?: number, limit?: number, search?: string }} params
   */
  async getJobApplications(jobId, params = {}) {
    try {
      if (!jobId || jobId === 'all') {
        return this.getAllRecruiterApplications(params);
      }
      const response = await apiClient.get(`/applications/jobs/${jobId}`, { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[applicationApi] Lỗi getJobApplications(${jobId}), dùng mock data:`, err.message);
      return this._getMockApplications({ jobId, ...params });
    }
  },

  /**
   * Lấy toàn bộ ứng viên của tất cả các tin tuyển dụng thuộc công ty
   */
  async getAllRecruiterApplications(params = {}) {
    try {
      const response = await apiClient.get('/applications/recruiter/all', { params });
      return response.data?.data || response.data;
    } catch (err) {
      return this._getMockApplications(params);
    }
  },

  /**
   * Nhà tuyển dụng cập nhật trạng thái vòng tuyển dụng và ghi chú đánh giá (UC40, UC41)
   * @param {string} applicationId
   * @param {{ status: string, note?: string, interviewDetails?: object }} data
   */
  async updateApplicationStatus(applicationId, data) {
    try {
      const response = await apiClient.patch(`/applications/${applicationId}/status`, data);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[applicationApi] Lỗi updateApplicationStatus(${applicationId}), cập nhật mock:`, err.message);
      return this._updateMockStatus(applicationId, data);
    }
  },

  // ── MOCK DATA HELPERS KHI BACKEND OFFLINE ─────────────────────────────────
  _getMockApplications({ jobId, status, search, page = 1, limit = 50 } = {}) {
    let list = [..._MOCK_APPLICATIONS_STORE];

    if (jobId && jobId !== 'all') {
      list = list.filter((a) => a.jobId === jobId);
    }

    if (status && status !== 'ALL') {
      list = list.filter((a) => a.applicationStatus === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail.toLowerCase().includes(q) ||
          (a.jobTitle && a.jobTitle.toLowerCase().includes(q)) ||
          (a.skills && a.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    return {
      data: list,
      pagination: {
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit) || 1,
      },
    };
  },

  _updateMockStatus(applicationId, { status, note, interviewDetails }) {
    const idx = _MOCK_APPLICATIONS_STORE.findIndex(
      (a) => a.id === applicationId || a.applicationId === applicationId
    );

    if (idx !== -1) {
      const current = _MOCK_APPLICATIONS_STORE[idx];
      const newHistory = {
        status,
        changedAt: new Date().toISOString(),
        changedBy: 'Trần Hoàng Nam (Recruiter)',
        note: note || `Chuyển trạng thái sang ${status}`,
      };

      const updated = {
        ...current,
        applicationStatus: status,
        lastNote: note || current.lastNote,
        interviewDetails: interviewDetails || current.interviewDetails,
        statusHistories: [newHistory, ...(current.statusHistories || [])],
        updatedAt: new Date().toISOString(),
      };

      _MOCK_APPLICATIONS_STORE[idx] = updated;
      return updated;
    }

    return null;
  },
};

// Kho mock data ứng viên phong phú cho Recruiter ATS
let _MOCK_APPLICATIONS_STORE = [
  {
    id: 'app-1',
    applicationId: 'app-1',
    jobId: 'rjob-1',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    candidateName: 'Nguyễn Văn An',
    candidateEmail: 'an.nguyen@example.com',
    candidatePhone: '0912 345 678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    experience: '4 năm kinh nghiệm',
    matchScore: 94,
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Zustand', 'Next.js'],
    applicationStatus: 'REVIEWING',
    appliedAt: '2026-11-04T08:30:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_NguyenVanAn_SeniorFrontend.pdf',
    coverLetter: 'Kính gửi ban tuyển dụng TechFlow,\n\nTôi có hơn 4 năm kinh nghiệm phát triển các sản phẩm Web ReactJS quy mô lớn. Tôi rất ấn tượng với định hướng phát triển giải pháp nhân sự của công ty và tự tin có thể đóng góp giá trị ngay từ ngày đầu làm việc.',
    lastNote: 'Hồ sơ chuyên môn rất tốt, code React sạch và nắm chắc Performance.',
    statusHistories: [
      {
        status: 'REVIEWING',
        changedAt: '2026-11-05T10:00:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Đang đánh giá vòng chuyên môn',
      },
      {
        status: 'VIEWED',
        changedAt: '2026-11-04T14:20:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Đã xem hồ sơ',
      },
      {
        status: 'APPLIED',
        changedAt: '2026-11-04T08:30:00.000Z',
        changedBy: 'Nguyễn Văn An',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-2',
    applicationId: 'app-2',
    jobId: 'rjob-1',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    candidateName: 'Trần Thị Mai',
    candidateEmail: 'mai.tran@example.com',
    candidatePhone: '0988 765 432',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    experience: '5 năm kinh nghiệm',
    matchScore: 91,
    skills: ['React', 'TypeScript', 'Redux Toolkit', 'GraphQL', 'Vite'],
    applicationStatus: 'INTERVIEW',
    appliedAt: '2026-11-03T11:15:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'TranThiMai_Senior_Frontend.pdf',
    coverLetter: 'Xin chào TechFlow, tôi mong muốn được tham gia vào đội ngũ kỹ thuật để cùng xây dựng các nền tảng số hiện đại.',
    lastNote: 'Đã hẹn phỏng vấn kỹ thuật online qua Google Meet.',
    interviewDetails: {
      date: '2026-11-12T09:30:00.000Z',
      location: 'Google Meet (meet.google.com/abc-xyz-techflow)',
      interviewer: 'Tech Lead & HR Manager',
    },
    statusHistories: [
      {
        status: 'INTERVIEW',
        changedAt: '2026-11-05T16:00:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Gửi lời mời phỏng vấn kỹ thuật',
      },
      {
        status: 'REVIEWING',
        changedAt: '2026-11-04T09:00:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Hồ sơ đạt yêu cầu, xếp lịch phỏng vấn',
      },
      {
        status: 'APPLIED',
        changedAt: '2026-11-03T11:15:00.000Z',
        changedBy: 'Trần Thị Mai',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-3',
    applicationId: 'app-3',
    jobId: 'rjob-2',
    jobTitle: 'Backend Node.js & Microservices Engineer',
    candidateName: 'Lê Hoàng Long',
    candidateEmail: 'long.le@example.com',
    candidatePhone: '0903 112 233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    experience: '3 năm kinh nghiệm',
    matchScore: 96,
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'RabbitMQ', 'Redis'],
    applicationStatus: 'HIRED',
    appliedAt: '2026-10-25T14:00:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_LeHoangLong_Backend_Engineer.pdf',
    coverLetter: 'Tôi có thế mạnh về thiết kế kiến trúc Microservices và tối ưu cơ sở dữ liệu quan hệ PostgreSQL.',
    lastNote: 'Ứng viên đã ký Offer letter chính thức. Ngày bắt đầu: 01/12/2026.',
    statusHistories: [
      {
        status: 'HIRED',
        changedAt: '2026-11-02T15:30:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Ứng viên chấp nhận lời mời làm việc (Offer Accepted)',
      },
      {
        status: 'INTERVIEW',
        changedAt: '2026-10-29T10:00:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Phỏng vấn xuất sắc cả 2 vòng',
      },
      {
        status: 'APPLIED',
        changedAt: '2026-10-25T14:00:00.000Z',
        changedBy: 'Lê Hoàng Long',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-4',
    applicationId: 'app-4',
    jobId: 'rjob-2',
    jobTitle: 'Backend Node.js & Microservices Engineer',
    candidateName: 'Phạm Minh Đức',
    candidateEmail: 'duc.pham@example.com',
    candidatePhone: '0977 445 566',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    experience: '2 năm kinh nghiệm',
    matchScore: 85,
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
    applicationStatus: 'APPLIED',
    appliedAt: '2026-11-05T18:40:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_PhamMinhDuc_BackendNodeJS.pdf',
    coverLetter: 'Mong muốn được thử sức trong môi trường công nghệ chuyên nghiệp của TechFlow.',
    lastNote: 'Mới nhận hồ sơ qua website, cần mở xem CV chi tiết.',
    statusHistories: [
      {
        status: 'APPLIED',
        changedAt: '2026-11-05T18:40:00.000Z',
        changedBy: 'Phạm Minh Đức',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-5',
    applicationId: 'app-5',
    jobId: 'rjob-3',
    jobTitle: 'Senior Product Designer (UI/UX)',
    candidateName: 'Vũ Thảo Nguyên',
    candidateEmail: 'nguyen.vu@example.com',
    candidatePhone: '0938 990 011',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    experience: '4 năm kinh nghiệm',
    matchScore: 89,
    skills: ['Figma', 'UI/UX', 'Design System', 'User Research'],
    applicationStatus: 'VIEWED',
    appliedAt: '2026-11-04T15:10:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'Portfolio_CV_VuThaoNguyen.pdf',
    coverLetter: 'Xin chào TechFlow, tôi gửi kèm link Portfolio Behance và các Case Study về sản phẩm SaaS B2B.',
    lastNote: 'Portfolio phong phú, phong cách thiết kế hiện đại, chuẩn B2B.',
    statusHistories: [
      {
        status: 'VIEWED',
        changedAt: '2026-11-05T08:15:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Đã mở xem hồ sơ và Portfolio',
      },
      {
        status: 'APPLIED',
        changedAt: '2026-11-04T15:10:00.000Z',
        changedBy: 'Vũ Thảo Nguyên',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-6',
    applicationId: 'app-6',
    jobId: 'rjob-1',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    candidateName: 'Đỗ Quốc Huy',
    candidateEmail: 'huy.do@example.com',
    candidatePhone: '0918 887 766',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    experience: '1 năm kinh nghiệm',
    matchScore: 68,
    skills: ['HTML/CSS', 'JavaScript', 'React cơ bản'],
    applicationStatus: 'REJECTED',
    appliedAt: '2026-10-30T09:20:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'DoQuocHuy_CV_Frontend.pdf',
    coverLetter: 'Em mới tốt nghiệp và mong muốn tìm kiếm cơ hội học hỏi tại công ty.',
    lastNote: 'Chưa đáp ứng đủ yêu cầu 3 năm kinh nghiệm vị trí Senior. Đã lưu hồ sơ cho đợt tuyển Junior.',
    statusHistories: [
      {
        status: 'REJECTED',
        changedAt: '2026-11-01T11:00:00.000Z',
        changedBy: 'Trần Hoàng Nam',
        note: 'Từ chối - Không đủ số năm kinh nghiệm yêu cầu',
      },
      {
        status: 'APPLIED',
        changedAt: '2026-10-30T09:20:00.000Z',
        changedBy: 'Đỗ Quốc Huy',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
  {
    id: 'app-7',
    applicationId: 'app-7',
    jobId: 'rjob-4',
    jobTitle: 'DevOps & Cloud Infrastructure Specialist',
    candidateName: 'Hoàng Thanh Tùng',
    candidateEmail: 'tung.hoang@example.com',
    candidatePhone: '0966 332 211',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    experience: '3 năm kinh nghiệm',
    matchScore: 92,
    skills: ['Kubernetes', 'AWS', 'Docker', 'CI/CD', 'Terraform'],
    applicationStatus: 'APPLIED',
    appliedAt: '2026-11-05T20:10:00.000Z',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_HoangThanhTung_DevOps_Engineer.pdf',
    coverLetter: 'Kính gửi TechFlow, tôi có kinh nghiệm vận hành cụm K8s và triển khai CI/CD pipeline tự động hóa.',
    lastNote: 'Mới nộp, có chứng chỉ AWS Solution Architect.',
    statusHistories: [
      {
        status: 'APPLIED',
        changedAt: '2026-11-05T20:10:00.000Z',
        changedBy: 'Hoàng Thanh Tùng',
        note: 'Nộp hồ sơ ứng tuyển',
      },
    ],
  },
];

export default applicationApi;
