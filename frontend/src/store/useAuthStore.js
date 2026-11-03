import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),

  loginSuccess: (user, accessToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
