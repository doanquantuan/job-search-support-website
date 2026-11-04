import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Banknote,
  Briefcase,
  Bookmark,
} from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';
import { CompanyLogo } from '@/components/common/CompanyLogo';

export const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { savedJobIds, toggleSaveJob, setSelectedJob } = useJobStore();

  const {
    id,
    jobId,
    title = 'Chức danh công việc',
    company = {},
    location = 'Toàn quốc',
    salary = 'Thỏa thuận',
    deadline = 'Đang tuyển',
    companyId,
  } = job;

  const realId = id || jobId;
  const isSaved = savedJobIds.includes(realId);

  const companyName = company.companyName || company.name || 'Doanh nghiệp';
  const companyLogo = company.logo;

  // Điều hướng đến trang chi tiết việc làm
  const handleCardClick = () => {
    navigate(`/jobs/${realId}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    toggleSaveJob(realId);
  };

  const handleQuickApply = (e) => {
    e.stopPropagation();
    setSelectedJob(job);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group card bg-base-100 border border-base-200/90 shadow-2xs hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div className="p-5 space-y-3.5 flex-1">
        {/* Hàng Header: Logo + Chức danh + Nút lưu tin */}
        <div className="flex items-start gap-3.5">
          {/* Logo Công ty tái sử dụng với hover scale đồng bộ */}
          <CompanyLogo
            src={companyLogo}
            name={companyName}
            size="md"
            className="ring-1 ring-base-200/60 group-hover:scale-105 transition-transform duration-300"
          />

          {/* Tiêu đề công việc & Tên công ty */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-bold text-base sm:text-lg text-base-content group-hover:text-primary transition-colors line-clamp-1 flex-1"
                title={title}
              >
                <Link to={`/jobs/${realId}`} onClick={(e) => e.stopPropagation()}>
                  {title}
                </Link>
              </h3>

              <button
                type="button"
                onClick={handleBookmarkClick}
                className={`btn btn-ghost btn-xs btn-circle shrink-0 transition-colors ${
                  isSaved
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-base-content/40 hover:text-primary hover:bg-base-200'
                }`}
                title={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tên công ty & Huy hiệu xác thực */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {companyId ? (
                <Link
                  to={`/companies/${companyId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs sm:text-sm font-medium text-base-content/70 hover:text-primary transition-colors truncate"
                >
                  {companyName}
                </Link>
              ) : (
                <span className="text-xs sm:text-sm font-medium text-base-content/70 truncate">
                  {companyName}
                </span>
              )}
              <CheckCircle2
                className="w-3.5 h-3.5 text-success shrink-0"
                title="Doanh nghiệp đã xác thực"
              />
            </div>
          </div>
        </div>

        {/* Hàng Mức lương */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 font-bold text-xs sm:text-sm border border-primary-200/60 dark:border-primary-800/50">
            <Banknote className="w-4 h-4 shrink-0 text-primary-600 dark:text-emerald-400" />
            <span>{salary}</span>
          </div>
        </div>

        {/* Địa điểm & Cấp bậc */}
        <div className="flex items-center gap-4 text-xs text-base-content/70">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
            <span className="truncate font-medium">{location}</span>
          </div>

          <span className="opacity-40">•</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <Briefcase className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
            <span className="truncate">{job.level || 'Nhân viên'}</span>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom Bar đồng bộ CompanyCard ── */}
      <div className="px-5 py-3.5 bg-base-200/40 border-t border-base-200/80 flex items-center justify-between gap-3">
        {/* Hạn nộp hồ sơ */}
        <div className="flex items-center gap-1.5 text-xs text-base-content/70">
          <Calendar className="w-3.5 h-3.5 text-base-content/40" />
          <span>
            Hạn nộp: <strong className="text-base-content font-semibold">{deadline}</strong>
          </span>
        </div>

        {/* Nút Xem chi tiết & Ứng tuyển */}
        <button
          type="button"
          onClick={handleQuickApply}
          className="btn btn-ghost btn-xs h-8 px-3 text-xs font-semibold text-base-content group-hover:text-primary group-hover:bg-primary/10 gap-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <span>Ứng tuyển ngay</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
