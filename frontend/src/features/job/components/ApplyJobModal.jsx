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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [selectedCvId, setSelectedCvId] = useState('');
  const [cvList, setCvList] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tự động điền thông tin và tải danh sách CV khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    setApplied(false);
    setErrorMessage('');
    setNote('');

    if (user) {
      setFullName(user.fullName || user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const chosenCv = cvList.find((c) => (c.id || c.cvId) === selectedCvId);
      await applicationApi.applyJob({
        jobId: job.id,
        cvId: selectedCvId || undefined,
        cvUrl: chosenCv?.fileUrl || undefined,
        cvTitle: chosenCv?.title || undefined,
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-content/40 backdrop-blur-xs animate-in fade-in duration-200">
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

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="form-control">
                    <label className="label py-1 text-2xs font-bold text-base-content/70">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="input input-sm input-bordered rounded-lg text-xs"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1 text-2xs font-bold text-base-content/70">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987654321"
                      className="input input-sm input-bordered rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 text-2xs font-bold text-base-content/70">
                    Email liên hệ *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input input-sm input-bordered rounded-lg text-xs"
                  />
                </div>

                {/* CV Selection */}
                <div className="form-control">
                  <div className="flex items-center justify-between py-1">
                    <label className="label py-0 text-2xs font-bold text-base-content/70">
                      Chọn CV ứng tuyển
                    </label>
                    <Link
                      to="/cvs"
                      target="_blank"
                      className="text-2xs text-primary font-semibold hover:underline"
                    >
                      + Quản lý CV
                    </Link>
                  </div>

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
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning-content flex items-center justify-between">
                      <span className="text-2xs">Bạn chưa có CV nào trong hồ sơ.</span>
                      <Link to="/cvs" className="btn btn-warning btn-2xs text-2xs">
                        Tải CV lên ngay
                      </Link>
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
                        Đang gửi...
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
