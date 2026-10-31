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
    <div className="min-h-screen bg-slate-50/70 text-gray-800 flex flex-col font-sans">
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Quản lý CV của tôi
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Còn <span className="font-semibold text-gray-900">{Math.max(0, 5 - cvs.length)}/5</span> CV có thể tải lên (PDF, DOC, DOCX tối đa 10MB)
                </p>
              </div>

              {/* Nút Tải lên CV duy nhất */}
              <button
                disabled={isMaxReached}
                onClick={() => fileInputRef.current?.click()}
                title={isMaxReached ? "Đã đạt giới hạn tối đa 5 CV" : "Chọn file CV từ máy tính"}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors ${
                  isMaxReached
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                }`}
              >
                <Plus className="w-4 h-4" />
                Tải lên CV mới
              </button>
            </div>

            {/* Active Upload Item & Progress */}
            {uploadingFile && (
              <div className="p-4 rounded-xl border border-orange-100 bg-white shadow-2xs flex items-center gap-3 transition-all">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <UploadCloud className="w-5 h-5 animate-pulse" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {uploadingFile.name}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <p className="text-2xs text-gray-500">
                    Đang tải • {uploadProgress}%
                  </p>
                </div>

                <button
                  onClick={cancelUpload}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Inline Error Banner */}
            {uploadError && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-2xs" />
                <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-2xs" />
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
                          className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                        >
                          {/* Left info */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                              <FileText className="w-5 h-5" />
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
                                    className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                  />
                                  <button
                                    onClick={() => saveRename(id)}
                                    className="p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Lưu"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingCvId(null)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                    title="Hủy"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                    {cv.title || cv.name || "CV Không có tên"}
                                  </h3>

                                  {cv.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col gap-1 mt-2 text-xs sm:text-xs text-gray-500">
                                <p>
                                  <span className="text-gray-400">Định dạng:</span>{" "}
                                  <span className="text-gray-700">PDF</span>
                                </p>
                                <p>
                                  <span className="text-gray-400">Dung lượng:</span>{" "}
                                  <span className="text-gray-700">
                                    {formatFileSize(cv.fileSize)}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-gray-400">Ngày tải lên:</span>{" "}
                                  <span className="text-gray-700">
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
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Xem
                              </a>
                            )}

                            {!isEditing && (
                              <button
                                onClick={() => startRename(cv)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Đổi tên
                              </button>
                            )}

                            <button
                              onClick={() => setCvToDelete(cv)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
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
                  <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-2xs text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 ring-8 ring-orange-50/50">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                      Bạn chưa có CV nào
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-4">
                      Tải CV đầu tiên để hồ sơ của bạn được hoàn thiện hơn khi ứng tuyển.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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

      {/* Footer note */}
      <footer className="py-4 border-t border-gray-100 text-center text-2xs text-gray-400">
        Không gian tài khoản • Hồ sơ
      </footer>
    </div>
  );
};

export default CvManagementPage;
