import { create } from "zustand";

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),

  loginSuccess: (user, accessToken) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.warn("Không thể lưu user vào localStorage:", e);
    }
    localStorage.setItem("accessToken", accessToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  updateUser: (partialUser) => {
    set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, ...partialUser };
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (e) {
        console.warn("Không thể lưu user vào localStorage:", e);
      }
      return { user: updatedUser };
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
