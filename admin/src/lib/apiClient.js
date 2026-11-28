import axios from "axios";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor: Gắn admin_access_token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

const clearAdminSession = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_user");
  useAdminAuthStore.setState({
    adminUser: null,
    token: null,
    isAuthenticated: false,
    isCheckingAuth: false,
  });
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Interceptor: Tự động refresh token khi gặp lỗi 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const skipPaths = ["/auth/refresh", "/auth/login", "/auth/logout"];
    if (skipPaths.some((path) => originalRequest.url?.includes(path))) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken, user } = response.data?.data || response.data;

      if (!accessToken || (user && user.role !== "ADMIN")) {
        throw new Error("Phiên đăng nhập quản trị không hợp lệ.");
      }

      localStorage.setItem("admin_access_token", accessToken);
      if (user) {
        try {
          localStorage.setItem("admin_user", JSON.stringify(user));
        } catch {
          // bỏ qua lỗi lưu localStorage
        }
      }

      useAdminAuthStore.setState((state) => ({
        token: accessToken,
        adminUser: user || state.adminUser,
        isAuthenticated: true,
      }));

      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAdminSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
