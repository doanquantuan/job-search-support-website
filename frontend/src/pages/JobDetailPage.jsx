import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { JobCard } from '@/features/job/components/JobCard';
import { JobDetailModal } from '@/features/company/components/JobDetailModal';
import { ReportJobModal } from '@/features/job/components/ReportJobModal';
import { useJobStore } from '@/store/useJobStore';
import { useAuthStore } from '@/store/useAuthStore';
import { jobApi } from '@/features/job/services/jobApi';
import { applicationApi } from '@/features/job/services/applicationApi';
import { useJobReportStore } from '@/store/useJobReportStore';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  Clock,
  Banknote,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentJob: job,
    similarJobs,
    detailLoading: loading,
    detailError: error,
    fetchJobDetail,
    fetchSavedJobs,
    savedJobIds,
    toggleSaveJob,
  } = useJobStore();

  const { user, isAuthenticated } = useAuthStore();
  const openReportModal = useJobReportStore((state) => state.openReportModal);
  const isJobReported = useJobReportStore((state) => state.isJobReported);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetail(id);
      jobApi.recordJobView(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isAuthenticated && user?.role !== 'RECRUITER') {
      fetchSavedJobs();
    }
  }, [id, fetchJobDetail, isAuthenticated, user?.role, fetchSavedJobs]);

  // Kiểm tra xem ứng viên đã nộp đơn vào công việc này chưa
  useEffect(() => {
    let isMounted = true;
    const targetJobId = job?.id || id;

    if (targetJobId && isAuthenticated && user?.role !== 'RECRUITER') {
      setCheckingApplied(true);

      const checkPromise = applicationApi.checkJobApplied(targetJobId);
      const myAppsPromise = applicationApi.getMyApplications({ limit: 100 }).catch(() => null);

      Promise.all([checkPromise, myAppsPromise])
        .then(([checkRes, myAppsRes]) => {
          if (!isMounted) return;
          const directCheck = Boolean(checkRes?.hasApplied);

          const appList = Array.isArray(myAppsRes)
            ? myAppsRes
            : Array.isArray(myAppsRes?.data)
            ? myAppsRes.data
            : Array.isArray(myAppsRes?.items)
            ? myAppsRes.items
            : [];

          const foundInList = appList.some((app) => {
            if (app.applicationStatus === 'WITHDRAWN') return false;
            const appJobId = String(app.jobId || app.job?.id || app.jobPost?.jobId || '').toLowerCase();
            const currentId = String(targetJobId).toLowerCase();
            const paramId = String(id || '').toLowerCase();
            return Boolean(appJobId && (appJobId === currentId || appJobId === paramId));
          });

          setHasApplied(directCheck || foundInList);
        })
        .catch((err) => {
          console.warn('[JobDetailPage] Lỗi kiểm tra trạng thái ứng tuyển:', err);
          if (isMounted) setHasApplied(false);
        })
        .finally(() => {
          if (isMounted) setCheckingApplied(false);
        });
    } else {
      setHasApplied(false);
    }
    return () => {
      isMounted = false;
    };
  }, [id, job?.id, isAuthenticated, user?.role]);

  const targetJobId = job?.id || job?.jobId || id;
  const isSaved = targetJobId
    ? savedJobIds.some((sid) => String(sid).toLowerCase() === String(targetJobId).toLowerCase())
    : false;
  const isReported = job ? isJobReported(job.id) : false;

  // Đồng bộ kiểm tra trực tiếp trạng thái lưu việc làm với backend
  useEffect(() => {
    if (targetJobId && isAuthenticated && user?.role !== 'RECRUITER') {
      jobApi.checkIsJobSaved(targetJobId).then((res) => {
        if (res?.isSaved) {
          useJobStore.setState((state) => ({
            savedJobIds: [...new Set([...state.savedJobIds, targetJobId])],
          }));
        }
      }).catch(() => {});
    }
  }, [targetJobId, isAuthenticated, user?.role]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplySuccess = (jobTitle) => {
    setHasApplied(true);
    setToastMessage(`Nộp đơn ứng tuyển thành công vị trí: ${jobTitle}!`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200/30 text-base-content">
        <AppHeader />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          <div className="h-6 w-32 bg-base-200 animate-pulse rounded-lg mb-6" />
          <div className="card bg-base-100 border border-base-200 p-8 rounded-2xl animate-pulse space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-base-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-base-200 rounded w-2/3" />
                <div className="h-4 bg-base-200 rounded w-1/3" />
              </div>
            </div>
            <div className="h-12 bg-base-200 rounded-xl w-full" />
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200/30 text-base-content">
        <AppHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="card bg-base-100 border border-base-200 p-10 rounded-2xl shadow-xs">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-base-content mb-2">
              Không tìm thấy tin tuyển dụng
            </h2>
            <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
              Tin tuyển dụng này có thể đã hết hạn hoặc tạm dừng nhận hồ sơ.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/jobs" className="btn btn-primary rounded-xl text-white">
                Xem việc làm khác
              </Link>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const company = job.company || {};
  const isDraft = job?.status === 'DRAFT';
  const isClosed = ['CLOSED', 'EXPIRED', 'AUTO_HIDDEN', 'BANNED'].includes(job?.status);

  const companyInitials = (company.name || 'DN')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-base-200/30 text-base-content font-sans">
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Breadcrumb quay lại */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60 mb-5">
          <button
            onClick={() => navigate('/jobs')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Việc làm</span>
          </button>
          <span>/</span>
          <span className="truncate max-w-xs sm:max-w-md text-base-content/90 font-semibold">
            {job.title}
          </span>
        </div>

        {/* Cảnh báo trạng thái tin tuyển dụng: DRAFT hoặc CLOSED */}
        {isDraft && (
          <div className="alert alert-warning mb-6 shadow-xs rounded-2xl flex items-start sm:items-center gap-3 border border-warning/30 bg-warning/10 text-warning-content">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold">Bản nháp:</span> Tin tuyển dụng này hiện đang được lưu dưới dạng bản nháp và chưa được Nhà tuyển dụng phát hành công khai. Hệ thống tạm thời đóng chức năng nộp đơn ứng tuyển cho vị trí này.
            </div>
          </div>
        )}

        {isClosed && (
          <div className="alert alert-error mb-6 shadow-xs rounded-2xl flex items-start sm:items-center gap-3 border border-error/30 bg-error/10 text-error">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold">Đã đóng tuyển dụng:</span> Tin tuyển dụng này đã hết hạn hoặc tạm dừng nhận hồ sơ.
            </div>
          </div>
        )}

        {/* ── BANNER HEADER CÔNG VIỆC CHÍNH ── */}
        <div className="card bg-base-100 border border-base-200/90 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Cột trái: Logo & Thông tin công việc */}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-base-100 border border-base-200 ring-1 ring-base-200/60 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {company.logo && !imgError ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl select-none">
                    {companyInitials || <Building2 className="w-8 h-8" />}
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary text-white text-2xs font-bold py-1 px-2.5">
                    {job.industry || 'Tuyển dụng trực tiếp'}
                  </span>
                  {job.isHot && (
                    <span className="badge badge-error/15 text-error text-2xs font-bold border-0">
                      Tuyển gấp
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-base-content tracking-tight">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 flex-wrap">
                  {job.companyId ? (
                    <Link
                      to={`/companies/${job.companyId}`}
                      className="text-sm sm:text-base font-semibold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{company.name}</span>
                    </Link>
                  ) : (
                    <span className="text-sm sm:text-base font-semibold text-base-content/80 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{company.name}</span>
                    </span>
                  )}

                  {company.isVerified && (
                    <CheckCircle2
                      className="w-4 h-4 text-success"
                      title="Doanh nghiệp đã xác thực"
                    />
                  )}
                </div>

                {/* Thông tin nhanh: Lương, Địa điểm, Hạn */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-2 text-xs sm:text-sm text-base-content/70">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200/60">
                    <Banknote className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-base-content/40" />
                    <span>{job.province || job.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-base-content/40" />
                    <span>
                      Hạn nộp: <strong className="text-base-content">{job.deadline}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Các nút CTA Ứng tuyển & Lưu tin */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-base-200">
              {checkingApplied ? (
                <button
                  type="button"
                  disabled
                  className="btn btn-primary px-8 h-12 rounded-xl text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-wait flex-1 md:flex-initial opacity-80"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </button>
              ) : hasApplied ? (
                <Link
                  to="/my-applications"
                  className="btn btn-success text-white px-8 h-12 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer flex-1 md:flex-initial"
                  title="Bạn đã nộp hồ sơ cho việc làm này. Nhấn để quản lý đơn ứng tuyển."
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  <span>Đã ứng tuyển</span>
                </Link>
              ) : isDraft ? (
                <button
                  type="button"
                  disabled
                  className="btn btn-disabled bg-base-300 text-base-content/60 px-8 h-12 rounded-xl font-bold text-sm flex items-center gap-2 cursor-not-allowed flex-1 md:flex-initial"
                  title="Tin tuyển dụng này đang là bản nháp, chưa mở nhận hồ sơ."
                >
                  <Clock className="w-4 h-4" />
                  <span>Bản nháp (Chưa mở nộp đơn)</span>
                </button>
              ) : isClosed ? (
                <button
                  type="button"
                  disabled
                  className="btn btn-disabled bg-base-300 text-base-content/60 px-8 h-12 rounded-xl font-bold text-sm flex items-center gap-2 cursor-not-allowed flex-1 md:flex-initial"
                  title="Tin tuyển dụng đã hết hạn hoặc tạm dừng nhận hồ sơ."
                >
                  <Clock className="w-4 h-4" />
                  <span>Đã đóng tuyển dụng</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="btn btn-primary px-8 h-12 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer flex-1 md:flex-initial"
                >
                  <Send className="w-4 h-4" />
                  <span>Ứng tuyển ngay</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveJob(targetJobId)}
                  className={`btn btn-ghost btn-sm h-10 px-3.5 rounded-xl border border-base-300 gap-1.5 font-medium transition ${
                    isSaved
                      ? 'text-primary border-primary bg-primary/10'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                  }`}
                  title={isSaved ? 'Đã lưu việc làm' : 'Lưu tin'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu tin'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="btn btn-ghost btn-sm h-10 px-3.5 rounded-xl border border-base-300 text-base-content/70 hover:text-base-content hover:bg-base-200 gap-1.5 font-medium"
                  title="Chia sẻ tin tuyển dụng"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
                </button>

                <button
                  type="button"
                  disabled={isReported}
                  onClick={() => openReportModal({ id: job.id, title: job.title, companyName: company.name })}
                  className={`btn btn-ghost btn-sm h-10 px-3 rounded-xl border gap-1.5 font-medium transition ${
                    isReported
                      ? 'border-base-200 bg-base-200/50 text-base-content/40 cursor-not-allowed opacity-60'
                      : 'border-base-300 text-error/80 hover:text-error hover:bg-error/10 hover:border-error/30'
                  }`}
                  title={isReported ? 'Bạn đã gửi báo cáo cho tin tuyển dụng này' : 'Báo cáo tin tuyển dụng vi phạm'}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">{isReported ? 'Đã báo cáo' : 'Báo cáo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── BỐ CỤC 2 CỘT NỘI DUNG ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI (2/3): MÔ TẢ, YÊU CẦU, QUYỀN LỢI */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tổng quan thông số công việc */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Thông tin chung</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Cấp bậc
                    </span>
                    <span className="font-semibold text-base-content">{job.level}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Kinh nghiệm
                    </span>
                    <span className="font-semibold text-base-content">{job.experience}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Số lượng tuyển
                    </span>
                    <span className="font-semibold text-base-content">{job.vacancies} người</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Bằng cấp
                    </span>
                    <span className="font-semibold text-base-content">{job.educationLevel}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Hình thức làm việc
                    </span>
                    <span className="font-semibold text-base-content">
                      {job.workplaceType} ({job.employmentType})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Giờ làm việc
                    </span>
                    <span className="font-semibold text-base-content">{job.workingHours || "Thứ 2 – Thứ 6 (Giờ hành chính)"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-base-200/40">
                  <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base-content/60 block text-2xs uppercase tracking-wider font-semibold">
                      Ngành nghề
                    </span>
                    <span className="font-semibold text-base-content">{job.industry || "Công nghệ thông tin"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết: Kỹ năng chuyên môn yêu cầu */}
            {job.skills && job.skills.length > 0 && (
              <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Kỹ năng chuyên môn yêu cầu</span>
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {job.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-semibold shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chi tiết: Mô tả công việc */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                Mô tả công việc
              </h2>
              <div className="text-sm leading-relaxed text-base-content/80 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Chi tiết: Yêu cầu ứng viên */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                Yêu cầu ứng viên
              </h2>
              {typeof job.requirements === 'string' && job.requirements.includes('\n') ? (
                <ul className="space-y-2 text-sm leading-relaxed text-base-content/85">
                  {job.requirements.split('\n').filter(Boolean).map((line, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{line.replace(/^[-•*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm leading-relaxed text-base-content/80 whitespace-pre-line">
                  {job.requirements}
                </div>
              )}
            </div>

            {/* Chi tiết: Quyền lợi được hưởng */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                Quyền lợi được hưởng
              </h2>
              {typeof job.benefits === 'string' && job.benefits.includes('\n') ? (
                <ul className="space-y-2 text-sm leading-relaxed text-base-content/85">
                  {job.benefits.split('\n').filter(Boolean).map((line, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                      <span>{line.replace(/^[-•*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm leading-relaxed text-base-content/80 whitespace-pre-line">
                  {job.benefits}
                </div>
              )}
            </div>

            {/* Địa điểm làm việc chi tiết */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Địa điểm làm việc</span>
              </h2>
              <p className="text-sm text-base-content/80">{job.address || job.province}</p>
            </div>
          </div>

          {/* CỘT PHẢI (1/3): THÔNG TIN CÔNG TY & VIỆC LÀM TƯƠNG TỰ */}
          <div className="space-y-6">
            {/* Box thông tin công ty */}
            <div className="card bg-base-100 border border-base-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-base-content">Về công ty tuyển dụng</h3>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-base-100 border border-base-200 flex items-center justify-center overflow-hidden shrink-0">
                  {company.logo && !imgError ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-base-content line-clamp-1">
                    {company.name}
                  </h4>
                  <p className="text-xs text-base-content/60 truncate mt-0.5">
                    {company.industry || 'Doanh nghiệp'}
                  </p>
                </div>
              </div>

              {company.description && (
                <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
                  {company.description}
                </p>
              )}

              {company.address && (
                <div className="text-xs text-base-content/70 flex items-start gap-1.5 pt-2 border-t border-base-200">
                  <MapPin className="w-3.5 h-3.5 text-base-content/40 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{company.address}</span>
                </div>
              )}

              {job.companyId && (
                <Link
                  to={`/companies/${job.companyId}`}
                  className="btn btn-outline btn-primary btn-sm w-full rounded-xl gap-1 text-xs font-semibold"
                >
                  <span>Xem trang công ty</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Box cam kết & an toàn tìm việc */}
            <div className="card bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span>Bảo vệ quyền lợi ứng viên</span>
              </div>
              <p className="text-2xs sm:text-xs text-base-content/70 leading-relaxed">
                Nhà tuyển dụng không được thu bất kỳ khoản phí nào khi bạn nộp hồ sơ hoặc phỏng vấn.
              </p>
              {isReported ? (
                <div className="text-2xs text-base-content/50 font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Bạn đã gửi báo cáo vi phạm cho tin này</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openReportModal({ id: job.id, title: job.title, companyName: company.name })}
                  className="text-xs text-error font-semibold hover:underline flex items-center gap-1 pt-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Nếu phát hiện dấu hiệu lừa đảo? Báo cáo ngay</span>
                </button>
              )}
            </div>

            {/* Cột việc làm liên quan / tương tự */}
            {similarJobs && similarJobs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base text-base-content">
                  Việc làm tương tự
                </h3>
                <div className="space-y-3">
                  {similarJobs.map((simJob) => (
                    <JobCard key={simJob.id} job={simJob} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal nộp đơn ứng tuyển (chỉ mở khi tin đã PUBLISHED và chưa đóng) */}
      {isApplyModalOpen && !isDraft && !isClosed && (
        <JobDetailModal
          job={job}
          company={company}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onApplySuccess={handleApplySuccess}
        />
      )}

      {/* Modal báo cáo vi phạm */}
      <ReportJobModal />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <AppFooter />
    </div>
  );
};

export default JobDetailPage;

