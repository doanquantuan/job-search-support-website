import { create } from "zustand";
import { applicationApi } from "@/features/job/services/applicationApi";
import { toast } from "@/store/useToastStore";

export const useRecruiterApplicantStore = create((set, get) => ({
  // ── State ──
  applications: [],
  selectedJobId: "all",
  viewMode: "kanban", // "kanban" | "table"
  searchKeyword: "",
  selectedApplicant: null,
  isDrawerOpen: false,
  loading: false,
  updatingStatus: false,

  metrics: {
    total: 0,
    applied: 0,
    viewed: 0,
    reviewing: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  },

  // ── Actions ──

  fetchApplications: async (jobId) => {
    const targetJobId = jobId !== undefined ? jobId : get().selectedJobId;
    set({ loading: true, selectedJobId: targetJobId });

    try {
      const res = await applicationApi.getJobApplications(targetJobId, {
        limit: 100,
      });

      const rawList = Array.isArray(res) ? res : res.data || [];

      // Chuẩn hóa dữ liệu tương thích 100% giữa Backend Prisma (nested models) và Mock Data
      const list = rawList.map((a) => {
        const u = a.jobSeeker?.user || {};
        const j = a.jobPost || {};
        const latestHist = (a.statusHistories && a.statusHistories[0]) || {};
        return {
          ...a,
          id: a.applicationId || a.id,
          applicationId: a.applicationId || a.id,
          jobId: a.jobId || j.jobId,
          candidateName: a.candidateName || u.fullName || "Ứng viên",
          candidateEmail: a.candidateEmail || u.email || "",
          candidatePhone: a.candidatePhone || u.phone || "",
          avatar: a.avatar || u.avatar || "",
          jobTitle: a.jobTitle || j.title || "Vị trí tuyển dụng",
          applicationStatus: a.applicationStatus || a.status || "APPLIED",
          lastNote: a.lastNote || latestHist.note || "",
          cvUrl: a.cvUrl || "",
          cvTitle: a.cvTitle || "CV.pdf",
        };
      });

      // Tính toán metrics theo trạng thái
      const metrics = {
        total: list.length,
        applied: list.filter((a) => a.applicationStatus === "APPLIED").length,
        viewed: list.filter((a) => a.applicationStatus === "VIEWED").length,
        reviewing: list.filter((a) => a.applicationStatus === "REVIEWING").length,
        interview: list.filter((a) => a.applicationStatus === "INTERVIEW").length,
        hired: list.filter((a) => a.applicationStatus === "HIRED").length,
        rejected: list.filter((a) => a.applicationStatus === "REJECTED").length,
      };

      set({
        applications: list,
        metrics,
        loading: false,
      });
    } catch (err) {
      console.error("[useRecruiterApplicantStore] Lỗi fetchApplications:", err);
      set({ loading: false });
    }
  },

  setSelectedJobId: (jobId) => {
    set({ selectedJobId: jobId });
    get().fetchApplications(jobId);
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  setSearchKeyword: (searchKeyword) => {
    set({ searchKeyword });
  },

  openDrawer: async (applicant) => {
    set({ selectedApplicant: applicant, isDrawerOpen: true });

    // Nếu hồ sơ mới nộp (APPLIED), tự động chuyển sang ĐÃ XEM (VIEWED)
    if (applicant.applicationStatus === "APPLIED") {
      const appId = applicant.id || applicant.applicationId;
      try {
        await get().updateApplicantStatus(
          appId,
          "VIEWED",
          "Nhà tuyển dụng đã mở xem chi tiết hồ sơ",
          null,
          false // silent mode (không hiện toast pop-up cho việc xem)
        );
      } catch {
        // bỏ qua nếu lỗi ngầm
      }
    }
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },

  updateApplicantStatus: async (
    applicationId,
    newStatus,
    note = "",
    interviewDetails = null,
    showToastFeedback = true
  ) => {
    set({ updatingStatus: true });

    const prevList = get().applications;
    const target = prevList.find(
      (a) => a.id === applicationId || a.applicationId === applicationId
    );

    if (!target) {
      set({ updatingStatus: false });
      return;
    }

    // Optimistic UI update
    const updatedItem = {
      ...target,
      applicationStatus: newStatus,
      lastNote: note || target.lastNote,
      interviewDetails: interviewDetails || target.interviewDetails,
      statusHistories: [
        {
          status: newStatus,
          changedAt: new Date().toISOString(),
          changedBy: "Trần Hoàng Nam (Recruiter)",
          note: note || `Chuyển trạng thái sang ${newStatus}`,
        },
        ...(target.statusHistories || []),
      ],
    };

    const nextList = prevList.map((a) =>
      a.id === applicationId || a.applicationId === applicationId ? updatedItem : a
    );

    const nextMetrics = {
      total: nextList.length,
      applied: nextList.filter((a) => a.applicationStatus === "APPLIED").length,
      viewed: nextList.filter((a) => a.applicationStatus === "VIEWED").length,
      reviewing: nextList.filter((a) => a.applicationStatus === "REVIEWING").length,
      interview: nextList.filter((a) => a.applicationStatus === "INTERVIEW").length,
      hired: nextList.filter((a) => a.applicationStatus === "HIRED").length,
      rejected: nextList.filter((a) => a.applicationStatus === "REJECTED").length,
    };

    set({
      applications: nextList,
      metrics: nextMetrics,
      selectedApplicant:
        get().selectedApplicant?.id === applicationId ||
        get().selectedApplicant?.applicationId === applicationId
          ? updatedItem
          : get().selectedApplicant,
    });

    try {
      await applicationApi.updateApplicationStatus(applicationId, {
        status: newStatus,
        note,
        interviewDetails,
      });

      if (showToastFeedback) {
        toast.success(
          "Cập nhật thành công",
          `Hồ sơ của ${target.candidateName} đã được chuyển sang vòng: ${newStatus}`
        );
      }
    } catch (err) {
      // Rollback on failure
      set({ applications: prevList });
      toast.error("Không thể cập nhật trạng thái", err.message);
    } finally {
      set({ updatingStatus: false });
    }
  },
}));

export default useRecruiterApplicantStore;
