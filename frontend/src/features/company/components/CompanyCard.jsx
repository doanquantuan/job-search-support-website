import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CompanyLogo } from '@/components/common/CompanyLogo';

export const CompanyCard = ({ company }) => {
  const {
    id,
    name = 'Công ty',
    logo,
    industry = 'Công nghệ thông tin',
    size = '500+ nhân viên',
    description = 'Mô tả ngắn về công ty...',
    location = 'Hà Nội',
    rating = 4.5,
    reviewCount = 100,
    activeJobsCount = 0,
    tags = [],
    isFeatured = false,
  } = company;

  return (
    <Link
      to={`/companies/${id}`}
      className="block h-full group focus:outline-hidden"
    >
      <div className="card bg-base-100 border border-base-200 hover:border-primary/50 hover:shadow-sm transition-colors duration-200 overflow-hidden rounded-xl flex flex-col justify-between h-full cursor-pointer">
        <div className="p-5 space-y-3.5">
          {/* Header: Logo + Tên công ty rõ ràng trên nền trắng */}
          <div className="flex items-start gap-3.5">
            <CompanyLogo
              src={logo}
              name={name}
              size="md"
              className="border border-base-200 bg-base-100 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3
                  className="font-bold text-base text-base-content group-hover:text-primary transition-colors line-clamp-1"
                  title={name}
                >
                  {name}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" title="Đã xác thực" />
              </div>

              <p className="text-xs text-base-content/65 mt-0.5 truncate">
                <span>{industry}</span>
                <span className="mx-1.5 opacity-40">·</span>
                <span>{size}</span>
              </p>

              {isFeatured && (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold">
                  Nổi bật
                </span>
              )}
            </div>
          </div>

          {/* Mô tả ngắn */}
          <p className="text-xs sm:text-sm text-base-content/75 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {description}
          </p>

          {/* Tags gọn gàng */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-base-200/70 text-base-content/75 text-2xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Địa điểm & Đánh giá */}
          <div className="flex items-center justify-between text-xs text-base-content/70 pt-3 border-t border-base-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-base-content/45 shrink-0" />
              <span className="truncate font-medium">{location}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0 font-medium">
              <Star className="w-3.5 h-3.5 fill-warning stroke-warning" />
              <span className="font-semibold text-base-content">{(Number(rating) || 4.5).toFixed(1)}</span>
              <span className="text-base-content/45">({reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-base-200/40 border-t border-base-200 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span>{activeJobsCount} việc làm đang tuyển</span>
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-base-content/75 group-hover:text-primary transition-colors">
            <span>Xem công ty</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;
