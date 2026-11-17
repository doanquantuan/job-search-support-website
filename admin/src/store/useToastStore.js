import { create } from "zustand";

let toastCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = "info", title = "", message = "", duration = 3500 }) => {
    const id = `toast_${Date.now()}_${++toastCounter}`;
    const newToast = { id, type, title, message, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, title = "Thành công") => {
    return get().addToast({ type: "success", title, message });
  },

  error: (message, title = "Có lỗi xảy ra") => {
    return get().addToast({ type: "error", title, message, duration: 5000 });
  },

  warning: (message, title = "Cảnh báo") => {
    return get().addToast({ type: "warning", title, message, duration: 4000 });
  },

  info: (message, title = "Thông báo") => {
    return get().addToast({ type: "info", title, message });
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

export default useToastStore;
