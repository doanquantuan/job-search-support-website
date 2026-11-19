import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Send,
  FileText,
  AlertCircle,
  LogIn,
  UploadCloud,
  FileUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { applicationApi } from '@/features/job/services/applicationApi';
import { cvService } from '@/features/profile/services/cv.service';

/**
 * Modal nộp hồ sơ ứng tuyển (Apply Job Modal)
 */
export const ApplyJobModal = ({ job, company, isOpen, onClose, onApplySuccess }) => {
  const { user, isAuthenticated } = useAuthStore();

  const [applied, setApplied] = useState(false);
  const [note, setNote] = useState('');
  
  // CV Selection mode: 'SAVED' (từ danh sách đã lưu) hoặc 'UPLOAD' (tải lên từ máy)
  const [cvMode, setCvMode] = useState('SAVED');
  const [selectedCvId, setSelectedCvId] = useState('');
  const [cvList, setCvList] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tự động điền họ tên và tải danh sách CV khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    setApplied(false);
    setErrorMessage('');
    setNote('');
    setSelectedFile(null);
    setUploadProgress(0);
    setCvMode('SAVED');

    if (isAuthenticated) {
      setLoadingCvs(true);
      cvService
        .getCvs()
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setCvList(list);
          if (list.length > 0) {
            setSelectedCvId(list[0].id || list[0].cvId);
          }
        })
        .catch((err) => {
          console.warn('Không thể tải danh sách CV:', err.message);
          setCvList([]);
        })
        .finally(() => {
          setLoadingCvs(false);
        });
    }
  }, [isOpen, user, isAuthenticated]);

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn dung lượng tối đa 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước tập tin CV không được vượt quá 5MB.');
      return;
    }

    // Kiểm tra định dạng cho phép
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setErrorMessage('Chỉ chấp nhận tập tin định dạng PDF, DOC hoặc DOCX.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalCvId = null;
      let finalCvUrl = null;
      let finalCvTitle = null;

      if (cvMode === 'UPLOAD') {
        if (!selectedFile) {
          setErrorMessage('Vui lòng chọn tập tin CV từ máy tính của bạn.');
          setIsSubmitting(false);
          return;
        }

        // Tải CV lên Cloudflare R2 thông qua cvService
        const uploadRes = await cvService.uploadCv(
          selectedFile,
          selectedFile.name.replace(/\.[^/.]+$/, ''),
          (percent) => setUploadProgress(percent)
        );

        finalCvId = uploadRes?.cvId || uploadRes?.id;
        finalCvUrl = uploadRes?.fileUrl;
        finalCvTitle = uploadRes?.title || selectedFile.name;
      } else {
        const chosenCv = cvList.find((c) => (c.id || c.cvId) === selectedCvId);
        if (!chosenCv && cvList.length > 0) {
          setErrorMessage('Vui lòng chọn một CV để nộp hồ sơ.');
          setIsSubmitting(false);
          return;
        }
        finalCvId = selectedCvId || undefined;
        finalCvUrl = chosenCv?.fileUrl || undefined;
        finalCvTitle = chosenCv?.title || undefined;
      }

      await applicationApi.applyJob({
        jobId: job.id,
        cvId: finalCvId || undefined,
        cvUrl: finalCvUrl || undefined,
        cvTitle: finalCvTitle || undefined,
        coverLetter: note.trim() || undefined,
        jobTitle: job.title,
      });

      setApplied(true);
      if (onApplySuccess) {
        onApplySuccess(job.title);
      }
    } catch (err) {
      console.error('Lỗi khi nộp hồ sơ ứng tuyển:', err);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Không thể nộp đơn ứng tuyển lúc này. Vui lòng thử lại sau.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-content/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-base-200 flex items-start justify-between gap-4 sticky top-0 bg-base-100 z-10">
          <div className="space-y-1">
            <span className="badge badge-primary text-white text-2xs font-bold">
              Tuyển dụng trực tiếp
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-base-content tracking-tight">
              {job.title}
            </h3>
            <p className="text-xs text-base-content/60 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{company?.name || job.companyName || 'Doanh nghiệp tuyển dụng'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Key Job Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Mức lương</span>
              <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">{job.salary || 'Thỏa thuận'}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Địa điểm</span>
              <p className="text-xs sm:text-sm font-bold text-base-content mt-0.5 truncate">{job.location || 'Toàn quốc'}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Kinh nghiệm</span>
              <p className="text-xs sm:text-sm font-bold text-base-content mt-0.5 truncate">{job.experience || 'Không yêu cầu'}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Hạn nộp</span>
              <p className="text-xs sm:text-sm font-bold text-base-content mt-0.5">{job.deadline || 'Đang tuyển'}</p>
            </div>
          </div>

          {/* Form ứng tuyển hoặc Thông báo thành công */}
          {!applied ? (
            !isAuthenticated ? (
              <div className="p-6 rounded-xl bg-base-200/40 border border-base-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-base-content">
                    Vui lòng đăng nhập để ứng tuyển
                  </h4>
                  <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
                    Đăng nhập giúp nhà tuyển dụng dễ dàng xem hồ sơ, CV và liên hệ phỏng vấn trực tiếp với bạn.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm px-6 text-white font-semibold rounded-lg text-xs"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="alert alert-error text-xs py-2.5 px-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* CV Selection: Tabs chọn có sẵn hoặc tải lên */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="label py-0 text-2xs font-bold text-base-content/70">
                      CV ứng tuyển *
                    </label>
                    {cvMode === 'SAVED' && (
                      <Link
                        to="/cvs"
                        target="_blank"
                        className="text-2xs text-primary font-semibold hover:underline"
                      >
                        + Quản lý CV
                      </Link>
                    )}
                  </div>

                  {/* Tab chuyển đổi phương thức CV */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-base-200/60 rounded-xl border border-base-200">
                    <button
                      type="button"
                      onClick={() => {
                        setCvMode('SAVED');
                        setErrorMessage('');
                      }}
                      className={`btn btn-xs rounded-lg font-semibold transition-all ${
                        cvMode === 'SAVED'
                          ? 'btn-primary text-white shadow-xs'
                          : 'btn-ghost text-base-content/70 hover:bg-base-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      CV đã lưu ({cvList.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCvMode('UPLOAD');
                        setErrorMessage('');
                      }}
                      className={`btn btn-xs rounded-lg font-semibold transition-all ${
                        cvMode === 'UPLOAD'
                          ? 'btn-primary text-white shadow-xs'
                          : 'btn-ghost text-base-content/70 hover:bg-base-200'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      Tải lên từ máy tính
                    </button>
                  </div>

                  {/* Phương thức 1: Chọn từ danh sách đã có */}
                  {cvMode === 'SAVED' && (
                    <div>
                      {loadingCvs ? (
                        <div className="h-9 flex items-center justify-center bg-base-200/50 rounded-lg text-xs text-base-content/50">
                          <span className="loading loading-spinner loading-xs mr-2" /> Đang tải danh sách CV...
                        </div>
                      ) : cvList.length > 0 ? (
                        <select
                          value={selectedCvId}
                          onChange={(e) => setSelectedCvId(e.target.value)}
                          className="select select-sm select-bordered rounded-lg text-xs w-full"
                        >
                          {cvList.map((cv) => (
                            <option key={cv.id || cv.cvId} value={cv.id || cv.cvId}>
                              {cv.title || 'CV đã tải lên'} {cv.isDefault ? '(Mặc định)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs text-warning-content flex items-center justify-between">
                          <span className="text-2xs">Bạn chưa có CV nào trong hồ sơ.</span>
                          <button
                            type="button"
                            onClick={() => setCvMode('UPLOAD')}
                            className="btn btn-warning btn-2xs text-2xs font-semibold"
                          >
                            Tải CV từ máy lên ngay
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phương thức 2: Tải lên trực tiếp từ máy tính */}
                  {cvMode === 'UPLOAD' && (
                    <div>
                      {!selectedFile ? (
                        <label className="border-2 border-dashed border-base-300 hover:border-primary/50 bg-base-200/30 hover:bg-primary/5 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                          <UploadCloud className="w-8 h-8 text-base-content/40 group-hover:text-primary transition-colors mb-1.5" />
                          <p className="text-xs font-semibold text-base-content/80 group-hover:text-primary">
                            Bấm để chọn file CV từ máy tính
                          </p>
                          <p className="text-2xs text-base-content/50 mt-0.5">
                            Hỗ trợ PDF, DOC, DOCX (Dung lượng tối đa 5MB)
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-base-content truncate max-w-xs sm:max-w-md">
                                {selectedFile.name}
                              </p>
                              <p className="text-2xs text-base-content/50">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tải lên
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                            title="Chọn file khác"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cover Letter / Note */}
                <div className="form-control">
                  <label className="label py-1 text-2xs font-bold text-base-content/70">
                    Thư giới thiệu bản thân (Cover letter)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với vị trí này..."
                    className="textarea textarea-bordered rounded-lg text-xs leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-ghost btn-sm px-4 rounded-lg text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-sm px-6 text-white font-semibold rounded-lg text-xs gap-1.5 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        {uploadProgress > 0 ? `Đang tải CV (${uploadProgress}%)...` : 'Đang gửi...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Nộp hồ sơ ứng tuyển
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-base-content">
                  Ứng tuyển thành công!
                </h4>
                <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                  Hồ sơ ứng tuyển của bạn đã được gửi trực tiếp đến nhà tuyển dụng. Bạn có thể theo dõi tiến độ xét duyệt tại mục Quản lý ứng tuyển.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary btn-sm px-5 text-white font-semibold rounded-lg text-xs"
                >
                  Hoàn tất
                </button>
                <Link
                  to="/my-applications"
                  onClick={onClose}
                  className="btn btn-ghost btn-sm px-5 font-semibold rounded-lg text-xs border border-base-300"
                >
                  Xem các đơn đã nộp
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export alias để tương thích các component cũ
export const JobDetailModal = ApplyJobModal;
export default ApplyJobModal;
