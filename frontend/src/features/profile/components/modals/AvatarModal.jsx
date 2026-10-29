import React, { useState, useRef } from "react";
import { Modal } from "./Modal";
import { UploadCloud, Trash2, Loader2 } from "lucide-react";

export const AvatarModal = ({
  isOpen,
  onClose,
  currentAvatar,
  fullName = "",
  onUpload,
  onDelete,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn định dạng tệp hình ảnh (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa là 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      const ok = await onUpload(selectedFile);
      if (ok) {
        handleClose();
      }
    } catch (err) {
      setError(err.message || "Tải ảnh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await onDelete();
      if (ok) {
        handleClose();
      }
    } catch (err) {
      setError(err.message || "Xóa ảnh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  const displayImage = previewUrl || currentAvatar;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : handleClose}
      title="Ảnh đại diện"
      subtitle="Tải ảnh mới hoặc xóa ảnh hiện tại"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {/* Preview circle */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full ring-4 ring-orange-50 overflow-hidden bg-gradient-to-tr from-orange-600 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(fullName)}</span>
            )}
          </div>
        </div>

        {/* Drag & drop or select button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-orange-50/20 mb-4"
        >
          <UploadCloud className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {selectedFile ? selectedFile.name : "Nhấn để chọn ảnh mới"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP tối đa 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg w-full mb-4 text-center">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full border-t border-gray-100 pt-4">
          {currentAvatar && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Xóa ảnh
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Tải ảnh
          </button>
        </div>
      </form>
    </Modal>
  );
};
