import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="toast toast-top toast-end z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`alert pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-box shadow-lg max-w-md w-full ${
            isSuccess ? "alert-success" : "alert-error"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}

          <div className="flex-1 text-sm">
            <p className="font-semibold">{toast.title || (isSuccess ? "Thành công" : "Đã có lỗi xảy ra")}</p>
            {toast.message && <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>}
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
