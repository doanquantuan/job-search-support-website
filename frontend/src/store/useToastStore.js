import { create } from "zustand";

export const useToastStore = create((set) => ({
  toasts: [],

  showToast: ({ type = "success", title = "", message = "", duration = 3500 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, title, message };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
}));

// Tiện ích gọi nhanh không cần import hook
export const toast = {
  success: (title, message = "") =>
    useToastStore.getState().showToast({ type: "success", title, message }),
  error: (title, message = "") =>
    useToastStore.getState().showToast({ type: "error", title, message }),
  info: (title, message = "") =>
    useToastStore.getState().showToast({ type: "info", title, message }),
  warning: (title, message = "") =>
    useToastStore.getState().showToast({ type: "warning", title, message }),
};
