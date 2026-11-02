import React, { useState, useEffect } from "react";
import { Camera, User, Briefcase, Shield } from "lucide-react";

export const ProfileHeader = ({
  avatar,
  fullName = "Chưa đặt tên",
  role = "JOB_SEEKER",
  extra = null,
  onAvatarClick = null,
  onEditClick = null,
}) => {
  // State theo dõi lỗi load ảnh — fallback về initials khi ảnh không load được
  const [imgError, setImgError] = useState(false);

  // Reset imgError mỗi khi avatar URL thay đổi (ví dụ: sau khi upload ảnh mới)
  useEffect(() => {
    setImgError(false);
  }, [avatar]);

  // Generate initials for avatar fallback (e.g., "Nguyễn Minh Anh" -> "MA")
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const roleConfig = {
    JOB_SEEKER: {
      label: "Người tìm việc",
      badgeClass: "border border-primary/20 bg-primary/10 text-primary",
      icon: User,
    },
    RECRUITER: {
      label: "Nhà tuyển dụng",
      badgeClass: "border border-secondary/20 bg-secondary/10 text-secondary",
      icon: Briefcase,
    },
    ADMIN: {
      label: "Quản trị viên",
      badgeClass: "border border-error/20 bg-error/10 text-error",
      icon: Shield,
    },
  };

  const currentRole = roleConfig[role] || roleConfig.JOB_SEEKER;
  const RoleIcon = currentRole.icon;

  // Hiển thị ảnh khi có URL hợp lệ và chưa bị lỗi load
  const showImage = avatar && !imgError;

  return (
    <div className="card relative overflow-hidden bg-base-100 border border-base-200 shadow-sm">
      {/* Decorative subtle gradient background */}
      <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-primary/15 via-primary/10 to-warning/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-8 -top-8 w-48 h-48 rounded-full border border-primary/15 pointer-events-none" />
        <div className="absolute right-16 top-4 w-32 h-32 rounded-full border border-primary/10 pointer-events-none" />
        <div className="absolute right-28 top-12 w-2.5 h-2.5 rounded-full bg-primary/30 pointer-events-none" />

        {onEditClick && (
          <button
            onClick={onEditClick}
            className="btn btn-sm absolute top-4 right-4 gap-1.5 bg-base-100/90 hover:bg-base-100 text-xs font-medium text-base-content border-base-300 shadow-sm backdrop-blur-sm"
          >
            <span className="text-sm">✎</span> Chỉnh sửa
          </button>
        )}
      </div>

      {/* Main Avatar & Profile Info Bar */}
      <div className="px-6 pb-6 pt-0 relative flex flex-col items-start text-left -mt-14 sm:-mt-16 gap-4">
        {/* Avatar with optional Camera button */}
        <div className="relative group flex-shrink-0">
          {/* Vòng nền gradient — luôn render, ảnh đè lên trên nếu có */}
          <div className="avatar placeholder">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-base-100 shadow-md overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold tracking-wider select-none">
              {showImage ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitials(fullName)}</span>
              )}
            </div>
          </div>

          {onAvatarClick && (
            <button
              onClick={onAvatarClick}
              title="Đổi ảnh đại diện"
              className="btn btn-primary btn-circle btn-xs w-8 h-8 absolute bottom-1 right-1 text-white ring-2 ring-base-100 shadow-md"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Name & Badges — bên dưới avatar, căn lề trái */}
        <div className="min-w-0 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
            {fullName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-start gap-2">
            {/* Role Badge */}
            <span
              className={`badge badge-lg gap-1.5 font-semibold text-xs py-3 ${currentRole.badgeClass}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              {currentRole.label}
            </span>

            {/* Extra Badge Slot (e.g., Job Search Status or Verification Status) */}
            {extra}
          </div>
        </div>
      </div>
    </div>
  );
};
