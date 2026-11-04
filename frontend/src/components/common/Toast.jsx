import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const getAlertStyle = (type) => {
  switch (type) {
    case "success":
      return {
        bg: "alert-success",
        icon: <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />,
        defaultTitle: "Thành công",
      };
    case "error":
      return {
        bg: "alert-error",
        icon: <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />,
        defaultTitle: "Đã có lỗi xảy ra",
      };
    case "warning":
      return {
        bg: "alert-warning",
        icon: <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />,
        defaultTitle: "Cảnh báo",
      };
    case "info":
    default:
      return {
        bg: "alert-info",
        icon: <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />,
        defaultTitle: "Thông báo",
      };
  }
};

/**
 * Toast đơn lẻ (dành cho các component cũ đang truyền prop { toast, onClose })
 */
export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const style = getAlertStyle(toast.type);

  return (
    <div className="toast toast-top toast-end z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`alert pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-box shadow-lg max-w-md w-full ${style.bg}`}
        >
          {style.icon}

          <div className="flex-1 text-sm">
            <p className="font-semibold">{toast.title || style.defaultTitle}</p>
            {toast.message && <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle"
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
    <div className="toast toast-top toast-end z-50 pointer-events-none flex flex-col gap-2 p-4">
      <AnimatePresence>
        {toasts.map((item) => {
          const style = getAlertStyle(item.type);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`alert pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-box shadow-xl max-w-md w-full ${style.bg}`}
            >
              {style.icon}

              <div className="flex-1 text-sm">
                <p className="font-semibold">{item.title || style.defaultTitle}</p>
                {item.message && <p className="text-xs mt-0.5 opacity-90">{item.message}</p>}
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="btn btn-ghost btn-xs btn-circle text-current/70 hover:text-current"
                aria-label="Đóng"
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
