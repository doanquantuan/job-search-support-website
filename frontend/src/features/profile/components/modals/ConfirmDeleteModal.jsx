import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle, Loader2 } from "lucide-react";

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xóa mục này?",
  itemTitle = "mục đã chọn",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Xác nhận xóa"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mb-4 ring-8 ring-error/5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h4 className="text-base font-bold text-base-content mb-1">
          Bạn có chắc muốn xóa {itemTitle ? `"${itemTitle}"` : "mục này"}?
        </h4>
        <p className="text-xs sm:text-sm text-base-content/60 max-w-xs mb-6">
          Mục này sẽ bị gỡ khỏi hồ sơ của bạn và hành động này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-3 w-full border-t border-base-200 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="btn btn-outline border-base-300 flex-1 h-10 min-h-10 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="btn btn-error flex-1 h-10 min-h-10 text-sm font-semibold text-white gap-2"
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            Xóa
          </button>
        </div>
      </div>
    </Modal>
  );
};
