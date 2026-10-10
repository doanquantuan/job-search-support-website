import { apiClient } from "@/lib/apiClient";

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
  verifyOtp: async (data) => {
    const response = await apiClient.post("/auth/verify-otp", data);
    return response.data;
  },
  resendOtp: async (data) => {
    const response = await apiClient.post("/auth/resend-otp", data);
    return response.data;
  },
  forgotPassword: async (data) => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (data) => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },
};

