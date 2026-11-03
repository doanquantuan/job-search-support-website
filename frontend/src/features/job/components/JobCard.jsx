import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Banknote,
  Briefcase,
} from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';

export const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { savedJobIds, toggleSaveJob, setSelectedJob } = useJobStore();
  const [imgError, setImgError] = useState(false);

  const {
    id,
    jobId,
    title = 'Chức danh công việc',
    company = {},
    location = 'Toàn quốc',
    salary = 'Thỏa thuận',
    employmentType = 'Toàn thời gian',
    workplaceType = 'Hybrid',
    postedAt = 'Mới đăng',
    deadline = 'Đang tuyển',
    isHot = false,
    experience = '1 - 3 năm',
    tags = [],
    companyId,
  } = job;

  const realId = id || jobId;
  const isSaved = savedJobIds.includes(realId);

  const companyName = company.companyName || 'Doanh nghiệp';
  const companyLogo = company.logo;

  const initials = companyName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

  // Các thẻ kỹ năng / tính chất công việc
  const displayBadges = [
    employmentType,
    workplaceType,
    experience,
    ...tags.slice(0, 2),
  ].filter(Boolean);

  return (
    <div
      onClick={handleCardClick}
      className="group card bg-base-100 border border-base-200/90 shadow-xs hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl flex flex-col justify-between h-full cursor-pointer"
    >
      {/* ── Phần thân thẻ (Content Body) ── */}
      <div className="p-5 space-y-3.5 flex-1">
        {/* Hàng Header: Logo + Chức danh + Nút lưu tin */}
        <div className="flex items-start gap-3.5">
          {/* Logo Công ty với ring & hover scale đồng bộ CompanyCard */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-base-100 border border-base-200/90 ring-1 ring-base-200/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
            {companyLogo && !imgError ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm sm:text-base select-none">
                {initials || <Building2 className="w-6 h-6" />}
              </div>
            )}
          </div>

          {/* Tiêu đề công việc & Tên công ty */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-bold text-base sm:text-lg text-base-content group-hover:text-primary transition-colors line-clamp-1"
                title={title}
              >
                <Link to={`/jobs/${realId}`} onClick={(e) => e.stopPropagation()}>
                  {title}
                </Link>
              </h3>


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

        {/* Hàng Mức lương & Huy hiệu Nổi bật */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* Mức lương nổi bật */}
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
