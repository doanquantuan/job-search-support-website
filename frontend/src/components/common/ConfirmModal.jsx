import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này? Thao tác này có thể không thể hoàn tác.",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  confirmColor = "btn-error",
  loading = false,
  icon: Icon = AlertTriangle,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-error/10 text-error shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-base-content/80 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn btn-sm text-white ${confirmColor}`}
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
