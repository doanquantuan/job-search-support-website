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
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 ring-8 ring-red-50/50">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h4 className="text-base font-bold text-gray-900 mb-1">
          Bạn có chắc muốn xóa {itemTitle ? `"${itemTitle}"` : "mục này"}?
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs mb-6">
          Mục này sẽ bị gỡ khỏi hồ sơ của bạn và hành động này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-3 w-full border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Xóa
          </button>
        </div>
      </div>
    </Modal>
  );
};
