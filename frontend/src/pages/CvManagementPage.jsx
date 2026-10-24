import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  AlertCircle,
  User,
  ExternalLink,
} from "lucide-react";

import { useCvManagement } from "../features/profile/hooks/useCvManagement";
import { Toast } from "../components/common/Toast";
import { ConfirmDeleteModal } from "../features/profile/components/modals/ConfirmDeleteModal";

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

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Drag events
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const isMaxReached = cvs.length >= 5;

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-800 flex flex-col font-sans">
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              ◈
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">Tài khoản</span>
          </div>

          <div
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Hồ sơ
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top bar with Back Button, Title, and Role Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay về Profile
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý CV của tôi
            </h1>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase">
            JOB_SEEKER
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-2xs" />
            <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-2xs" />
            <div className="h-44 bg-white rounded-2xl border border-gray-100 shadow-2xs" />
          </div>
        )}

        {/* Loaded CV Content */}
        {!loading && (
          <>
            {/* CV List Cards */}
            {cvs.length > 0 ? (
              <div className="space-y-3.5">
                {cvs.map((cv) => {
                  const id = cv.cvId || cv.id;
                  const isEditing = editingCvId === id;

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-100 transition-all"
                    >
                      {/* Left info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
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
                                className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                              <button
                                onClick={() => saveRename(id)}
                                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                title="Lưu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingCvId(null)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
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
                                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Mặc định
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-2xs sm:text-xs text-gray-400 mt-1">
                            PDF • {formatFileSize(cv.fileSize)} • {formatDate(cv.createdAt)}
                          </p>
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Đổi tên
                          </button>
                        )}

                        <button
                          onClick={() => setCvToDelete(cv)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors"
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
              /* Empty state (matching Image 2) */
              <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-2xs text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                  Bạn chưa có CV nào
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6">
                  Tải CV đầu tiên để hồ sơ của bạn được hoàn thiện hơn khi ứng tuyển.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tải lên CV mới
                </button>
              </div>
            )}

            {/* Counter & Upload Button Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Còn <span className="font-semibold text-gray-900">{Math.max(0, 5 - cvs.length)}/5</span> CV
              </span>

              <button
                disabled={isMaxReached}
                onClick={() => fileInputRef.current?.click()}
                title={isMaxReached ? "Đã đạt giới hạn tối đa 5 CV" : ""}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors ${
                  isMaxReached
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
                Tải lên CV mới
              </button>
            </div>

            {/* Upload Zone Card (matching Image 2) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Tải lên CV mới
                </h3>
                <span className="text-2xs sm:text-xs text-gray-400 font-medium">
                  PDF/DOC/DOCX • Tối đa 10MB
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isMaxReached && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
                  isMaxReached
                    ? "border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60"
                    : isDragOver
                    ? "border-indigo-500 bg-indigo-50/30 scale-[1.01]"
                    : "border-gray-200 hover:border-indigo-300 bg-slate-50/30 hover:bg-indigo-50/10 cursor-pointer"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-gray-800">
                  Kéo thả tệp hoặc chọn tệp
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Chọn tệp từ máy tính để tải CV lên nhanh chóng
                </p>

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
              </div>

              {/* Active Upload Item & Progress */}
              {uploadingFile && (
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center gap-3 transition-all">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <UploadCloud className="w-5 h-5 animate-pulse" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {uploadingFile.name}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <p className="text-2xs text-gray-500">
                      Đang tải • {uploadProgress}%
                    </p>
                  </div>

                  <button
                    onClick={cancelUpload}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
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
            </div>
          </>
        )}
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
