import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// === Request Interceptor: Gắn Access Token vào mỗi request ===
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// === Response Interceptor: Auto-refresh khi access token hết hạn ===

// Biến theo dõi trạng thái refresh — tránh gọi /auth/refresh nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  // Response thành công → trả về bình thường
  (response) => response,

  // Response lỗi → xử lý 401
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Không retry cho chính request /auth/refresh, /auth/login, /auth/register
    const skipPaths = ["/auth/refresh", "/auth/login", "/auth/register"];
    if (skipPaths.some((path) => originalRequest.url?.includes(path))) {
      return Promise.reject(error);
    }

    // Nếu đang có request refresh đang chạy → xếp hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    // Bắt đầu refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi backend refresh — cookie refreshToken được gửi tự động nhờ withCredentials: true
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const { accessToken, user } = response.data?.data || response.data;

      // Lưu access token mới
      localStorage.setItem("accessToken", accessToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Cập nhật Zustand store
      const store = useAuthStore.getState();
      store.loginSuccess(user || store.user, accessToken);

      // Xử lý hàng chờ — retry tất cả request đã bị 401
      processQueue(null, accessToken);

      // Retry request ban đầu với token mới
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → logout
      processQueue(refreshError, null);

      // Clear auth state và redirect về login
      useAuthStore.getState().logout();
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
