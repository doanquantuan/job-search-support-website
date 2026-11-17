import { create } from "zustand";
import apiClient from "@/lib/apiClient";

export const useNotificationStore = create((set, get) => ({
  pendingCompaniesCount: 0,
  pendingReportsCount: 0,
  isLoading: false,
  lastFetched: null,

  fetchNotificationCounts: async () => {
    set({ isLoading: true });
    try {
      const [compRes, reportRes] = await Promise.allSettled([
        apiClient.get("/companies", { params: { verificationStatus: "PENDING", limit: 1 } }),
        apiClient.get("/job-reports", { params: { status: "PENDING", limit: 1 } }),
      ]);

      const pendingCompanies =
        compRes.status === "fulfilled"
          ? compRes.value.data?.data?.pagination?.total || 0
          : get().pendingCompaniesCount;

      const pendingReports =
        reportRes.status === "fulfilled"
          ? reportRes.value.data?.data?.pagination?.total || reportRes.value.data?.data?.total || 0
          : get().pendingReportsCount;

      set({
        pendingCompaniesCount: pendingCompanies,
        pendingReportsCount: pendingReports,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (err) {
      console.warn("Không thể tải số lượng thông báo:", err.message);
      set({ isLoading: false });
    }
  },

  decrementPendingCompanies: (amount = 1) => {
    set((state) => ({
      pendingCompaniesCount: Math.max(0, state.pendingCompaniesCount - amount),
    }));
  },

  decrementPendingReports: (amount = 1) => {
    set((state) => ({
      pendingReportsCount: Math.max(0, state.pendingReportsCount - amount),
    }));
  },

  incrementPendingCompanies: (amount = 1) => {
    set((state) => ({
      pendingCompaniesCount: state.pendingCompaniesCount + amount,
    }));
  },

  incrementPendingReports: (amount = 1) => {
    set((state) => ({
      pendingReportsCount: state.pendingReportsCount + amount,
    }));
  },

  setPendingCompaniesCount: (count) => {
    set({ pendingCompaniesCount: Math.max(0, count) });
  },

  setPendingReportsCount: (count) => {
    set({ pendingReportsCount: Math.max(0, count) });
  },
}));

export default useNotificationStore;
