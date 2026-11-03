import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Building2, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CompanyCard = ({ company }) => {
  const [imgError, setImgError] = useState(false);

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

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="group card bg-base-100 border border-base-200/90 shadow-xs hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl flex flex-col justify-between h-full">
      <div>
        {/* Top Mini Cover Header */}
        <div className="h-16 w-full bg-gradient-to-r from-primary/20 via-accent/15 to-transparent relative p-3 flex justify-end items-start">
          {isFeatured && (
            <span className="badge badge-primary text-white font-bold text-2xs py-1 px-2.5 shadow-2xs">
              ★ Nổi bật
            </span>
          )}
        </div>

        {/* Content Body with Overlapping Logo */}
        <div className="px-5 pb-5 -mt-8 space-y-3">
          {/* Logo & Headline */}
          <div className="flex items-start gap-3.5">
            {/* Overlapping Logo */}
            <div className="w-14 h-14 rounded-xl bg-base-100 border-2 border-base-100 ring-1 ring-base-200 shadow-md flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
              {logo && !imgError ? (
                <img
                  src={logo}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base select-none">
                  {initials || <Building2 className="w-6 h-6" />}
                </div>
              )}
            </div>

            {/* Title & Industry / Size */}
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/companies/${id}`}
                  className="font-bold text-base sm:text-lg text-base-content group-hover:text-primary transition-colors line-clamp-1"
                  title={name}
                >
                  {name}
                </Link>
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" title="Đã xác thực" />
              </div>
              <p className="text-xs text-base-content/60 mt-0.5 truncate">
                <span>{industry}</span>
                <span className="mx-1.5 opacity-40">•</span>
                <span>{size}</span>
              </p>
            </div>
          </div>

          {/* Description (Clean 2-line clamp) */}
          <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {description}
          </p>

          {/* Feature Tags (Hybrid, Thưởng, etc.) */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-base-200/80 text-base-content/70 text-2xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Location & Rating row */}
          <div className="flex items-center justify-between text-xs text-base-content/70 pt-2.5 border-t border-base-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
              <span className="truncate font-medium">{location}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0 font-medium">
              <Star className="w-3.5 h-3.5 fill-warning stroke-warning" />
              <span className="font-bold text-base-content">{rating.toFixed(1)}</span>
              <span className="text-base-content/40">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar: Active Jobs & Action button */}
      <div className="px-5 py-3.5 bg-base-300/40 border-t border-base-200/80 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span>{activeJobsCount} việc làm đang tuyển</span>
        </span>

        <Link
          to={`/companies/${id}`}
          className="btn btn-ghost btn-xs h-8 px-3 text-xs font-semibold text-base-content group-hover:text-primary group-hover:bg-primary/10 gap-1 rounded-btn transition-colors"
        >
          <span>Xem công ty</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
