import React, { useState, useRef } from "react";
import { Modal } from "./Modal";
import { UploadCloud, Trash2, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

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
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Vui lòng chọn một ảnh để tải lên");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onUpload(selectedFile);
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải ảnh lên");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;
    if (!window.confirm("Bạn có chắc chắn muốn gỡ ảnh đại diện?")) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete();
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Không thể xóa ảnh");
    } finally {
      setLoading(false);
    }
  };

  const displayImage = previewUrl || currentAvatar;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cập nhật ảnh đại diện"
      subtitle="Tải ảnh mới hoặc xóa ảnh hiện tại"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {/* Preview circle */}
        <div className="avatar placeholder mb-6">
          <div className="w-28 h-28 rounded-full ring-4 ring-primary/15 overflow-hidden bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-md">
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
          className="w-full border-2 border-dashed border-base-300 hover:border-primary rounded-box p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-base-200/50 hover:bg-primary/5 mb-4"
        >
          <UploadCloud className="w-8 h-8 text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">
            {selectedFile ? selectedFile.name : "Nhấn để chọn ảnh mới"}
          </p>
          <p className="text-xs text-base-content/50 mt-1">PNG, JPG, WEBP tối đa 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </div>

        {error && (
          <div className="alert alert-error p-2.5 rounded-btn w-full mb-4 text-xs text-center justify-center">
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full border-t border-base-200 pt-4">
          {currentAvatar && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="btn btn-error btn-outline h-10 min-h-10 px-4 text-sm font-medium gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Xóa ảnh
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="btn btn-outline border-base-300 flex-1 h-10 min-h-10 px-4 text-sm font-medium"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="btn btn-primary flex-1 h-10 min-h-10 px-4 text-sm font-semibold text-white gap-2"
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            Tải ảnh
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AvatarModal;
