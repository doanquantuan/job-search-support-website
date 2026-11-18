import { create } from "zustand";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

const getInitialSidebarState = () => {
  try {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  } catch {
    return false;
  }
};

// Áp dụng class dark ban đầu
const initialDark = getInitialTheme();
if (typeof document !== "undefined") {
  if (initialDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const useUIStore = create((set, get) => ({
  isDark: initialDark,
  isSidebarCollapsed: getInitialSidebarState(),

  toggleTheme: () => {
    const nextDark = !get().isDark;
    if (typeof document !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
    set({ isDark: nextDark });
  },

  setTheme: (theme) => {
    const isDark = theme === "dark";
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
    set({ isDark });
  },

  toggleSidebar: () => {
    const nextCollapsed = !get().isSidebarCollapsed;
    try {
      localStorage.setItem("admin_sidebar_collapsed", String(nextCollapsed));
    } catch {}
    set({ isSidebarCollapsed: nextCollapsed });
  },

  setSidebarCollapsed: (collapsed) => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", String(collapsed));
    } catch {}
    set({ isSidebarCollapsed: !!collapsed });
  },
}));

export default useUIStore;
