import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const getAlertStyle = (type) => {
  switch (type) {
    case "success":
      return {
        bg: "alert-success text-success-content",
        icon: <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-current" />,
        defaultTitle: "Thành công",
      };
    case "error":
      return {
        bg: "alert-error text-error-content",
        icon: <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-current" />,
        defaultTitle: "Đã có lỗi xảy ra",
      };
    case "warning":
      return {
        bg: "alert-warning text-warning-content",
        icon: <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-current" />,
        defaultTitle: "Cảnh báo",
      };
    case "info":
    default:
      return {
        bg: "alert-info text-info-content",
        icon: <Info className="w-5 h-5 shrink-0 mt-0.5 text-current" />,
        defaultTitle: "Thông báo",
      };
  }
};

/**
 * Toast đơn lẻ (dành cho các component gọi trực tiếp: { toast, onClose, duration = 4000 })
 * Tự động tắt sau 4s mà không bị treo/đứng màn hình.
 */
export const Toast = ({ toast, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!toast || !onClose || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const style = getAlertStyle(toast.type);

  return (
    <div className="toast toast-top toast-end z-[9999] pointer-events-none p-4 max-w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={toast.message || toast.title || "toast-single"}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`alert pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border border-black/10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md ${style.bg}`}
        >
          {style.icon}

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug break-words">
              {toast.title || style.defaultTitle}
            </p>
            {toast.message && (
              <p className="text-xs mt-1 opacity-90 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle shrink-0 text-current/70 hover:text-current hover:bg-black/10 ml-1"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * ToastContainer toàn cục gắn tại App.jsx (hiển thị danh sách toast từ useToastStore)
 */
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast toast-top toast-end z-[9999] pointer-events-none flex flex-col gap-2.5 p-4 max-w-full">
      <AnimatePresence>
        {toasts.map((item) => {
          const style = getAlertStyle(item.type);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`alert pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border border-black/10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md ${style.bg}`}
            >
              {style.icon}

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-snug break-words">
                  {item.title || style.defaultTitle}
                </p>
                {item.message && (
                  <p className="text-xs mt-1 opacity-90 leading-relaxed break-words">
                    {item.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="btn btn-ghost btn-xs btn-circle shrink-0 text-current/70 hover:text-current hover:bg-black/10 ml-1"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
