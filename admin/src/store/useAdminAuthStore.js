import { create } from "zustand";
import apiClient from "@/lib/apiClient";

const getSavedUser = () => {
  try {
    const raw = localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAdminAuthStore = create((set) => ({
  adminUser: getSavedUser(),
  token: localStorage.getItem("admin_access_token") || null,
  isAuthenticated: !!localStorage.getItem("admin_access_token"),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { user, accessToken } = response.data.data;

      // Kiểm tra nghiêm ngặt: Chỉ tài khoản có vai trò ADMIN mới được phép truy cập
      if (user.role !== "ADMIN") {
        throw new Error("Tài khoản của bạn không có quyền truy cập vào cổng quản trị hệ thống!");
      }

      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_user", JSON.stringify(user));

      set({
        adminUser: user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      const msg = err.response?.data?.message || err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_user");
    set({ adminUser: null, token: null, isAuthenticated: false });
    window.location.href = "/login";
  },
}));

export default useAdminAuthStore;
