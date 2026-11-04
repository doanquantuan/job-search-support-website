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

export const JobDetailModal = ({ job, company, isOpen, onClose, onApplySuccess }) => {
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
      await applicationApi.applyJob({
        jobId: job.id,
        cvId: selectedCvId || undefined,
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
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.location || job.province || 'Toàn quốc'}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Hình thức</span>
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.workplaceType || job.type || 'Toàn thời gian'}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Kinh nghiệm</span>
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.experience || 'Không yêu cầu'}</p>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-base-content/70 uppercase">Kỹ năng yêu cầu:</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-base-200 text-xs font-medium text-base-content/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Form / Authentication Banner */}
          {!isAuthenticated ? (
            <div className="pt-4 border-t border-base-200 text-center p-6 bg-base-200/40 rounded-2xl border border-dashed border-base-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-base-content">
                Đăng nhập để nộp hồ sơ ứng tuyển
              </h4>
              <p className="text-xs text-base-content/70 max-w-sm mx-auto">
                Bạn cần đăng nhập bằng tài khoản Ứng viên để gửi CV trực tiếp đến nhà tuyển dụng.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link to="/login" className="btn btn-primary btn-sm px-5 text-white font-bold rounded-xl text-xs">
                  Đăng nhập ngay
                </Link>
                <Link to="/register" className="btn btn-ghost btn-sm px-5 font-semibold rounded-xl text-xs border border-base-300">
                  Tạo tài khoản mới
                </Link>
              </div>
            </div>
          ) : !applied ? (
            <form onSubmit={handleSubmit} className="pt-4 border-t border-base-200 space-y-3.5">
              <h4 className="font-bold text-sm text-base-content flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Nộp hồ sơ ứng tuyển</span>
              </h4>

              {errorMessage && (
                <div className="alert alert-error text-xs py-2.5 px-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Lựa chọn CV đính kèm */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-2xs font-bold text-base-content/70 uppercase">
                    Chọn CV ứng tuyển
                  </label>
                  <Link
                    to="/cvs"
                    target="_blank"
                    className="text-2xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Quản lý kho CV</span>
                  </Link>
                </div>

                {loadingCvs ? (
                  <div className="skeleton h-9 w-full rounded-lg" />
                ) : cvList.length > 0 ? (
                  <select
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="select select-bordered select-sm w-full text-xs rounded-lg font-medium focus:select-primary bg-base-100"
                  >
                    {cvList.map((cv) => (
                      <option key={cv.id || cv.cvId} value={cv.id || cv.cvId}>
                        📄 {cv.title || 'CV Đính kèm'} ({cv.fileSize ? `${Math.round(cv.fileSize / 1024)} KB` : 'PDF'})
                      </option>
                    ))}
                    <option value="">Không đính kèm file CV</option>
                  </select>
                ) : (
                  <div className="p-3 bg-base-200/50 rounded-xl border border-base-200 text-xs text-base-content/70 flex items-center justify-between">
                    <span>Bạn chưa có CV nào trong kho lưu trữ.</span>
                    <Link to="/cvs" className="text-primary font-bold hover:underline">
                      Tải CV lên ngay →
                    </Link>
                  </div>
                )}
              </div>

              {/* Thông tin liên hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-base-content/70">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                  />
                </div>
                <div>
                  <label className="text-2xs font-semibold text-base-content/70">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-2xs font-semibold text-base-content/70">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-base-content/70">
                  Thư giới thiệu / Lời nhắn (Cover Letter)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Nêu ngắn gọn kinh nghiệm, kỹ năng thế mạnh và lý do bạn phù hợp với công việc..."
                  className="textarea textarea-bordered textarea-sm w-full rounded-lg text-xs mt-1 focus:textarea-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost btn-sm text-xs font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm px-6 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Nộp hồ sơ ngay'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-success/10 border border-success/20 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
              <h4 className="font-bold text-base text-base-content">
                Đã nộp hồ sơ ứng tuyển thành công!
              </h4>
              <p className="text-xs text-base-content/70 max-w-sm mx-auto">
                Hồ sơ của bạn đã được chuyển tới nhà tuyển dụng của{' '}
                <span className="font-semibold text-primary">
                  {company?.name || job.companyName || 'công ty'}
                </span>
                . Bạn có thể theo dõi tiến độ xét duyệt bất cứ lúc nào.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
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

export default JobDetailModal;
