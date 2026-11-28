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

export const useAdminAuthStore = create((set, get) => ({
  adminUser: getSavedUser(),
  token: localStorage.getItem("admin_access_token") || null,
  isAuthenticated: !!localStorage.getItem("admin_access_token"),
  isLoading: false,
  isCheckingAuth: false,

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

  checkAuth: async () => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      set({ adminUser: null, token: null, isAuthenticated: false, isCheckingAuth: false });
      return false;
    }

    set({ isCheckingAuth: true });
    try {
      // Xác thực token với backend qua endpoint user profile
      const res = await apiClient.get("/users/me");
      const userData = res.data?.data;

      if (userData) {
        if (userData.role !== "ADMIN") {
          get().logout();
          return false;
        }

        localStorage.setItem("admin_user", JSON.stringify(userData));
        set({
          adminUser: userData,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
        return true;
      }
      set({ isCheckingAuth: false });
      return true;
    } catch (err) {
      console.warn("Xác thực token thất bại:", err.message);
      // Nếu token không hợp lệ (401/403), thực hiện đăng xuất
      if (err.response?.status === 401 || err.response?.status === 403) {
        get().logout();
        return false;
      }
      // Nếu lỗi mạng tạm thời, giữ nguyên trạng thái phiên hiện có
      set({ isCheckingAuth: false });
      return true;
    }
  },

  updateAdminProfile: (updatedData) => {
    set((state) => {
      const newUser = { ...state.adminUser, ...updatedData };
      localStorage.setItem("admin_user", JSON.stringify(newUser));
      return { adminUser: newUser };
    });
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Bỏ qua lỗi mạng/token hết hạn để vẫn dọn dẹp phiên ở client
    }
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_user");
    set({ adminUser: null, token: null, isAuthenticated: false, isCheckingAuth: false });
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  },
}));

export default useAdminAuthStore;
