import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { useCvManagement } from "../features/profile/hooks/useCvManagement";
import { Toast } from "../components/common/Toast";
import { ConfirmDeleteModal } from "../features/profile/components/modals/ConfirmDeleteModal";
import { ProfileSidebar } from "../components/common/ProfileSidebar";
import { AppHeader } from "../components/common/AppHeader";
import { AppFooter } from "../components/common/AppFooter";

export const CvManagementPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    cvs,
    loading,
    toast,
    setToast,
    uploadingFile,
    uploadProgress,
    uploadError,
    cancelUpload,
    handleUpload,
    handleRename,
    handleDelete,
  } = useCvManagement();

  // Rename state
  const [editingCvId, setEditingCvId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Delete modal state
  const [cvToDelete, setCvToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return "1.2MB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "15/10/2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const startRename = (cv) => {
    setEditingCvId(cv.cvId || cv.id);
    setEditTitle(cv.title || cv.name || "");
  };

  const saveRename = async (cvId) => {
    if (editTitle.trim()) {
      await handleRename(cvId, editTitle.trim());
    }
    setEditingCvId(null);
  };

  const confirmDelete = async () => {
    if (!cvToDelete) return;
    setDeleteLoading(true);
    try {
      await handleDelete(cvToDelete.cvId || cvToDelete.id);
      setCvToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isMaxReached = cvs.length >= 5;

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Shared App Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar Navigation */}
          <ProfileSidebar cvCount={cvs.length} completenessPercent={72} />

          {/* Right Main Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Top bar with Title, Counter and Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight">
                  Quản lý CV của tôi
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                  Còn <span className="font-semibold text-base-content">{Math.max(0, 5 - cvs.length)}/5</span> CV có thể tải lên (PDF, DOC, DOCX tối đa 10MB)
                </p>
              </div>

              {/* Nút Tải lên CV duy nhất */}
              <button
                disabled={isMaxReached}
                onClick={() => fileInputRef.current?.click()}
                title={isMaxReached ? "Đã đạt giới hạn tối đa 5 CV" : "Chọn file CV từ máy tính"}
                className="btn btn-primary h-10 min-h-10 text-xs sm:text-sm font-semibold text-white gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tải lên CV mới
              </button>
            </div>

            {/* Active Upload Item & Progress */}
            {uploadingFile && (
              <div className="card bg-base-100 p-4 border border-primary/20 shadow-sm flex-row items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-btn">
                  <UploadCloud className="w-5 h-5 animate-pulse" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-semibold text-base-content truncate">
                    {uploadingFile.name}
                  </p>

                  {/* daisyUI Progress bar */}
                  <progress
                    className="progress progress-primary w-full h-1.5"
                    value={uploadProgress}
                    max="100"
                  />

                  <p className="text-2xs text-base-content/60">
                    Đang tải • {uploadProgress}%
                  </p>
                </div>

                <button
                  onClick={cancelUpload}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/50"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Inline Error Banner */}
            {uploadError && (
              <div className="alert alert-error rounded-box text-xs flex items-center gap-2 py-3 px-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4">
                <div className="skeleton h-24 w-full rounded-box" />
                <div className="skeleton h-24 w-full rounded-box" />
              </div>
            )}

            {/* Loaded CV Content */}
            {!loading && (
              <>
                {/* CV List Cards */}
                {cvs.length > 0 ? (
                  <div className="space-y-3">
                    {cvs.map((cv) => {
                      const id = cv.cvId || cv.id;
                      const isEditing = editingCvId === id;

                      return (
                        <div
                          key={id}
                          className="card bg-base-100 p-4 sm:p-5 border border-base-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                        >
                          {/* Left info */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-box bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
                              <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <div className="flex items-center gap-2 max-w-md">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    autoFocus
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveRename(id);
                                      if (e.key === "Escape") setEditingCvId(null);
                                    }}
                                    className="input input-bordered input-sm flex-1 font-semibold focus:input-primary"
                                  />
                                  <button
                                    onClick={() => saveRename(id)}
                                    className="btn btn-primary btn-sm btn-square text-white"
                                    title="Lưu"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingCvId(null)}
                                    className="btn btn-ghost btn-sm btn-square"
                                    title="Hủy"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-base-content text-sm sm:text-base truncate">
                                    {cv.title || cv.name || "CV Không có tên"}
                                  </h3>

                                  {cv.isDefault && (
                                    <span className="badge badge-sm font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col gap-1 mt-2 text-xs text-base-content/60">
                                <p>
                                  <span className="text-base-content/40">Định dạng:</span>{" "}
                                  <span className="text-base-content/80">PDF</span>
                                </p>
                                <p>
                                  <span className="text-base-content/40">Dung lượng:</span>{" "}
                                  <span className="text-base-content/80">
                                    {formatFileSize(cv.fileSize)}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-base-content/40">Ngày tải lên:</span>{" "}
                                  <span className="text-base-content/80">
                                    {formatDate(cv.createdAt)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                            {cv.fileUrl && cv.fileUrl !== "#" && (
                              <a
                                href={cv.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm border-base-300 text-xs font-semibold gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Xem
                              </a>
                            )}

                            {!isEditing && (
                              <button
                                onClick={() => startRename(cv)}
                                className="btn btn-outline btn-sm border-base-300 text-xs font-semibold gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Đổi tên
                              </button>
                            )}

                            <button
                              onClick={() => setCvToDelete(cv)}
                              className="btn btn-error btn-outline btn-sm text-xs font-semibold gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="card bg-base-100 p-10 border border-base-200 shadow-sm text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-box bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-base-content text-base sm:text-lg mb-1">
                      Bạn chưa có CV nào
                    </h3>
                    <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mb-4">
                      Tải CV đầu tiên để hồ sơ của bạn được hoàn thiện hơn khi ứng tuyển.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary h-10 min-h-10 px-5 text-white text-xs sm:text-sm font-semibold gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Tải lên CV mới
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(cvToDelete)}
        onClose={() => setCvToDelete(null)}
        itemTitle={cvToDelete?.title || cvToDelete?.name || "CV này"}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />

      {/* Shared App Footer */}
      <AppFooter />
    </div>
  );
};

export default CvManagementPage;
