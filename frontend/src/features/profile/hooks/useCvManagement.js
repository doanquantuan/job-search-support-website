import { useState, useEffect, useCallback } from "react";
import { cvService } from "../services/cv.service";

export const useCvManagement = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Upload progress state
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const showToast = useCallback((type, title, message = "") => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const fetchCvs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cvService.getCvs();
      setCvs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch CVs:", err);
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách CV");
      setCvs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCvs();
  }, [fetchCvs]);

  const handleUpload = async (file, customTitle) => {
    if (!file) return;

    if (cvs.length >= 5) {
      showToast("error", "Giới hạn tải lên", "Bạn chỉ có thể tải lên tối đa 5 CV.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError("Kích thước tệp vượt quá 10MB. Vui lòng chọn tệp khác.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".pdf") &&
      !file.name.endsWith(".doc") &&
      !file.name.endsWith(".docx")
    ) {
      setUploadError("Chỉ chấp nhận tệp định dạng PDF, DOC, DOCX.");
      return;
    }

    setUploadError(null);
    setUploadingFile(file);
    setUploadProgress(10);

    try {
      const newCv = await cvService.uploadCv(
        file,
        customTitle || file.name.replace(/\.[^/.]+$/, ""),
        (percent) => setUploadProgress(percent)
      );

      if (newCv) {
        setCvs((prev) => [newCv, ...prev]);
      } else {
        await fetchCvs();
      }
      showToast("success", "Tải CV thành công", "CV đã được thêm vào kho của bạn.");
    } catch (err) {
      console.error("Upload API failed:", err);
      const errMsg = err?.response?.data?.message || "Không thể tải lên CV. Vui lòng thử lại.";
      setUploadError(errMsg);
      showToast("error", "Tải lên thất bại", errMsg);
    } finally {
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };

  const handleRename = async (cvId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return false;
    try {
      await cvService.updateCv(cvId, newTitle.trim());
      setCvs((prev) =>
        prev.map((c) =>
          c.cvId === cvId || c.id === cvId ? { ...c, title: newTitle.trim(), name: newTitle.trim() } : c
        )
      );
      showToast("success", "Đổi tên CV thành công");
      return true;
    } catch (err) {
      console.error("Rename CV failed:", err);
      showToast("error", "Đổi tên thất bại", err?.response?.data?.message || "Không thể đổi tên CV");
      return false;
    }
  };

  const handleDelete = async (cvId) => {
    try {
      await cvService.deleteCv(cvId);
      setCvs((prev) => prev.filter((c) => (c.cvId || c.id) !== cvId));
      showToast("success", "Xóa CV thành công");
      return true;
    } catch (err) {
      console.error("Delete CV failed:", err);
      showToast("error", "Xóa thất bại", err?.response?.data?.message || "Không thể xóa CV");
      return false;
    }
  };

  return {
    cvs,
    loading,
    error,
    toast,
    setToast,
    uploadingFile,
    uploadProgress,
    uploadError,
    cancelUpload: () => {
      setUploadingFile(null);
      setUploadProgress(0);
      setUploadError(null);
    },
    handleUpload,
    handleRename,
    handleDelete,
    refetch: fetchCvs,
  };
};
