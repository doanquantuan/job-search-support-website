import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/store/useToastStore';

export const REPORT_REASONS = [
  {
    id: 'FRAUD',
    label: 'Dấu hiệu lừa đảo / Đa cấp / Đóng phí',
    desc: 'Yêu cầu nộp tiền cọc, nạp tiền mua hàng, làm nhiệm vụ nhận hoa hồng, app cờ bạc.',
    badgeColor: 'badge-error',
  },
  {
    id: 'FAKE_INFORMATION',
    label: 'Thông tin giả mạo / Không đúng thực tế',
    desc: 'Mô tả công việc sai lệch hoàn toàn, địa chỉ công ty không có thật, mạo danh thương hiệu.',
    badgeColor: 'badge-warning',
  },
  {
    id: 'DUPLICATE',
    label: 'Tin đăng trùng lặp / Spam',
    desc: 'Một vị trí bị đăng nhiều lần liên tục làm loãng kết quả tìm kiếm.',
    badgeColor: 'badge-info',
  },
  {
    id: 'INAPPROPRIATE_CONTENT',
    label: 'Nội dung phản cảm / Thù địch / Vi phạm pháp luật',
    desc: 'Nội dung chứa từ ngữ phân biệt đối xử, quấy rối hoặc vi phạm đạo đức & pháp luật.',
    badgeColor: 'badge-secondary',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các vấn đề phát sinh khác không thuộc các danh mục trên.',
    badgeColor: 'badge-ghost',
  },
];

const REPORTED_JOB_IDS_KEY = 'reported_job_ids';

const getInitialReportedJobs = () => {
  try {
    const raw = localStorage.getItem(REPORTED_JOB_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useJobReportStore = create((set, get) => ({
  // Danh sách các jobId người dùng đã báo cáo (cache local + load từ server)
  reportedJobIds: getInitialReportedJobs(),

  // Kiểm tra 1 job đã được báo cáo chưa
  isJobReported: (jobId) => {
    if (!jobId) return false;
    const { reportedJobIds } = get();
    return reportedJobIds.includes(jobId);
  },

  // State modal
  isReportModalOpen: false,
  selectedJob: null, // { jobId, title, companyName }

  // Form State
  reason: 'FRAUD',
  description: '',
  submitting: false,

  // Lịch sử báo cáo của tôi
  myReports: [],
  myReportsLoading: false,
  myReportsPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },

  // Mở modal báo cáo cho một Job
  openReportModal: (job) => {
    set({
      isReportModalOpen: true,
      selectedJob: {
        jobId: job?.id || job?.jobId,
        title: job?.title || 'Tin tuyển dụng',
        companyName: job?.companyName || job?.company?.name || 'Doanh nghiệp',
      },
      reason: 'FRAUD',
      description: '',
    });
  },

  // Đóng modal
  closeReportModal: () => {
    set({
      isReportModalOpen: false,
      selectedJob: null,
      reason: 'FRAUD',
      description: '',
      submitting: false,
    });
  },

  setReason: (reason) => set({ reason }),
  setDescription: (description) => set({ description }),

  // Gửi báo cáo vi phạm
  submitReport: async () => {
    const { selectedJob, reason, description, closeReportModal } = get();

    if (!selectedJob?.jobId) {
      toast.error('Lỗi', 'Không tìm thấy thông tin tin tuyển dụng');
      return false;
    }

    if (!reason) {
      toast.error('Thiếu thông tin', 'Vui lòng chọn lý do báo cáo vi phạm');
      return false;
    }

    set({ submitting: true });
    try {
      const res = await apiClient.post('/job-reports', {
        jobId: selectedJob.jobId,
        reason,
        description: description?.trim() || undefined,
      });

      // Lưu jobId vào danh sách đã báo cáo
      const updatedReported = Array.from(new Set([...get().reportedJobIds, selectedJob.jobId]));
      try {
        localStorage.setItem(REPORTED_JOB_IDS_KEY, JSON.stringify(updatedReported));
      } catch (_e) {}
      set({ reportedJobIds: updatedReported });

      toast.success(
        'Báo cáo thành công',
        'Cảm ơn bạn đã đóng góp thông tin. Ban quản trị sẽ xác minh và xử lý nghiêm.'
      );
      closeReportModal();
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.';

      // Nếu backend trả về lỗi "Bạn đã gửi báo cáo cho tin tuyển dụng này rồi", cũng tự động đánh dấu đã báo cáo
      if (message.includes('đã gửi báo cáo')) {
        const updatedReported = Array.from(new Set([...get().reportedJobIds, selectedJob.jobId]));
        try {
          localStorage.setItem(REPORTED_JOB_IDS_KEY, JSON.stringify(updatedReported));
        } catch (_e) {}
        set({ reportedJobIds: updatedReported });
      }

      toast.error('Gửi báo cáo thất bại', message);
      return false;
    } finally {
      set({ submitting: false });
    }
  },

  // Lấy danh sách các báo cáo của ứng viên hiện tại
  fetchMyReports: async (params = {}) => {
    set({ myReportsLoading: true });
    try {
      const res = await apiClient.get('/job-reports/my-reports', { params });
      const payload = res.data?.data || res.data || {};
      const reports = payload.data || payload.items || [];

      // Đồng bộ các jobId từ danh sách đã báo cáo của user
      const serverReportedJobIds = reports
        .map((r) => r.jobId || r.job?.jobId)
        .filter(Boolean);
      const mergedJobIds = Array.from(new Set([...get().reportedJobIds, ...serverReportedJobIds]));
      try {
        localStorage.setItem(REPORTED_JOB_IDS_KEY, JSON.stringify(mergedJobIds));
      } catch (_e) {}

      set({
        myReports: reports,
        reportedJobIds: mergedJobIds,
        myReportsPagination: payload.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      });
    } catch (err) {
      console.error('Lỗi lấy danh sách báo cáo:', err);
    } finally {
      set({ myReportsLoading: false });
    }
  },
}));
