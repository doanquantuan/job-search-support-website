import { create } from "zustand";
import { jobApi } from "@/features/job/services/jobApi";
import { toast } from "@/store/useToastStore";

const DEFAULT_JOB_DRAFT = {
  title: "",
  occupationId: "it",
  industry: "Công nghệ thông tin",
  jobLevel: "MIDDLE",
  workMode: "HYBRID",
  employmentType: "FULL_TIME",
  salaryType: "RANGE", // "RANGE" | "NEGOTIABLE"
  salaryMin: 15000000,
  salaryMax: 25000000,
  province: "TP. Hồ Chí Minh",
  address: "Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Bến Nghé, Quận 1",
  quantity: 1,
  deadline: "",
  experience: "1 - 3 năm",
  skills: ["React", "TypeScript", "TailwindCSS"],
  description: "",
  requirements: [
    "Có ít nhất 2 năm kinh nghiệm làm việc thực tế ở vị trí tương đương.",
    "Thành thạo kỹ năng chuyên môn, tinh thần trách nhiệm và chủ động trong công việc.",
  ],
  benefits: [
    "Lương thưởng cạnh tranh, xét tăng lương định kỳ hàng năm.",
    "Bảo hiểm y tế cao cấp, khám sức khỏe định kỳ.",
    "Môi trường làm việc năng động, lộ trình thăng tiến rõ ràng.",
  ],
  status: "PUBLISHED",
};

export const useRecruiterJobStore = create((set, get) => ({
  // ── State ──
  jobs: [],
  totalJobs: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 8,
  filterStatus: "ALL", // "ALL" | "PUBLISHED" | "DRAFT" | "CLOSED" | "EXPIRED"
  searchTerm: "",
  loading: false,
  saving: false,
  error: null,

  metrics: {
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    expired: 0,
    totalApplications: 0,
    totalViews: 0,
  },

  // Multi-step Wizard Draft
  jobFormDraft: { ...DEFAULT_JOB_DRAFT },

  // ── Actions ──

  fetchJobs: async () => {
    return get().fetchMyJobs();
  },

  fetchMyJobs: async () => {
    const { filterStatus, searchTerm, currentPage, itemsPerPage } = get();
    set({ loading: true, error: null });

    try {
      const res = await jobApi.getMyJobs({
        status: filterStatus,
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      });

      const list = res.data || [];
      const pagination = res.pagination || {
        total: list.length,
        totalPages: 1,
      };

      set({
        jobs: list,
        totalJobs: pagination.total,
        totalPages: pagination.totalPages,
        loading: false,
      });

      // Tự động cập nhật metrics
      get().fetchMetrics();
    } catch (err) {
      console.error("[useRecruiterJobStore] Lỗi fetchMyJobs:", err);
      set({ loading: false, error: err.message });
    }
  },

  fetchMetrics: async () => {
    try {
      const metrics = await jobApi.getRecruiterJobMetrics();
      set({ metrics });
    } catch (err) {
      console.warn("[useRecruiterJobStore] Lỗi fetchMetrics:", err);
    }
  },

  setFilterStatus: (filterStatus) => {
    set({ filterStatus, currentPage: 1 });
    get().fetchMyJobs();
  },

  setSearchTerm: (searchTerm) => {
    set({ searchTerm, currentPage: 1 });
    get().fetchMyJobs();
  },

  setCurrentPage: (currentPage) => {
    set({ currentPage });
    get().fetchMyJobs();
  },

  createJobPost: async (jobData, isDraft = false) => {
    set({ saving: true });
    try {
      const payload = {
        ...jobData,
        status: isDraft ? "DRAFT" : "PUBLISHED",
      };

      const created = await jobApi.createJob(payload);
      toast.success(
        isDraft ? "Đã lưu bản nháp" : "Đăng tin thành công!",
        isDraft
          ? "Tin tuyển dụng đã được lưu vào danh sách bản nháp."
          : "Tin tuyển dụng của bạn đã sẵn sàng nhận hồ sơ ứng viên."
      );

      get().resetJobFormDraft();
      get().fetchMyJobs();
      set({ saving: false });
      return created;
    } catch (err) {
      set({ saving: false });
      toast.error("Không thể đăng tin", err.message);
      throw err;
    }
  },

  updateJobPost: async (jobId, jobData) => {
    set({ saving: true });
    try {
      const updated = await jobApi.updateJob(jobId, jobData);
      toast.success("Cập nhật thành công", "Thông tin tin tuyển dụng đã được lưu lại.");
      get().fetchMyJobs();
      set({ saving: false });
      return updated;
    } catch (err) {
      set({ saving: false });
      toast.error("Không thể cập nhật tin", err.message);
      throw err;
    }
  },

  // Optimistic Toggle Status
  toggleJobStatus: async (jobId) => {
    const prevJobs = get().jobs;
    const targetJob = prevJobs.find((j) => j.id === jobId || j.jobId === jobId);
    if (!targetJob) return;

    const newStatus = targetJob.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED";

    // Optimistic UI update
    set({
      jobs: prevJobs.map((j) =>
        j.id === jobId || j.jobId === jobId ? { ...j, status: newStatus } : j
      ),
    });

    try {
      await jobApi.toggleJobStatus(jobId, newStatus);
      toast.info(
        newStatus === "PUBLISHED" ? "Đã mở nhận hồ sơ" : "Đã tạm dừng nhận đơn",
        `Tin "${targetJob.title}" hiện ${
          newStatus === "PUBLISHED" ? "đang công khai nhận ứng viên" : "đã tạm dừng"
        }.`
      );
      get().fetchMetrics();
    } catch (err) {
      // Rollback on failure
      set({ jobs: prevJobs });
      toast.error("Lỗi khi thay đổi trạng thái", err.message);
    }
  },

  deleteJobPost: async (jobId) => {
    try {
      await jobApi.deleteJob(jobId);
      toast.success("Đã xóa tin tuyển dụng", "Tin đăng đã được gỡ bỏ khỏi hệ thống.");
      get().fetchMyJobs();
    } catch (err) {
      toast.error("Không thể xóa tin", err.message);
      throw err;
    }
  },

  setJobFormDraft: (updates) => {
    set((state) => ({
      jobFormDraft: {
        ...state.jobFormDraft,
        ...updates,
      },
    }));
  },

  resetJobFormDraft: () => {
    set({ jobFormDraft: { ...DEFAULT_JOB_DRAFT } });
  },
}));

export default useRecruiterJobStore;
