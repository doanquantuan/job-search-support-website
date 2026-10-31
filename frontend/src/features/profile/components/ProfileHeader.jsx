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
      colorClass: "bg-blue-50 text-blue-700 border-blue-200",
      icon: User,
    },
    RECRUITER: {
      label: "Nhà tuyển dụng",
      colorClass: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Briefcase,
    },
    ADMIN: {
      label: "Quản trị viên",
      colorClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Shield,
    },
  };

  const currentRole = roleConfig[role] || roleConfig.JOB_SEEKER;
  const RoleIcon = currentRole.icon;

  // Hiển thị ảnh khi có URL hợp lệ và chưa bị lỗi load
  const showImage = avatar && !imgError;

  return (
    <div className="relative rounded-lg overflow-hidden bg-white border border-gray-200 border-gray-100 shadow-sm">
      {/* Decorative subtle gradient background */}
      <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-red-50/80 via-orange-50/70 to-yellow-50/60 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-8 -top-8 w-48 h-48 rounded-full border border-indigo-100/60 pointer-events-none" />
        <div className="absolute right-16 top-4 w-32 h-32 rounded-full border border-indigo-100/40 pointer-events-none" />
        <div className="absolute right-28 top-12 w-2.5 h-2.5 rounded-full bg-indigo-300/40 pointer-events-none" />

        {onEditClick && (
          <button
            onClick={onEditClick}
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm border border-gray-200/60 transition-all hover:scale-105"
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
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold tracking-wider select-none">
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

          {onAvatarClick && (
            <button
              onClick={onAvatarClick}
              title="Đổi ảnh đại diện"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center ring-2 ring-white shadow-md transition-all hover:scale-110 active:scale-95"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Name & Badges — bên dưới avatar, căn lề trái */}
        <div className="min-w-0 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {fullName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-start gap-2">
            {/* Role Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold border ${currentRole.colorClass}`}
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
