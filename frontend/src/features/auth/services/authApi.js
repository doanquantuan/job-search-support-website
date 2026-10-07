import { apiClient } from "@/lib/apiClient";

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
};
