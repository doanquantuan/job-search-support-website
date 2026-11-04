import React, { useState, useEffect } from "react";
import { Camera, User, Briefcase, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

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
      badgeClass: "border border-accent/20 bg-accent/10 text-accent",
      icon: Shield,
    },
  };

  const currentRole = roleConfig[role] || roleConfig.JOB_SEEKER;
  const RoleIcon = currentRole.icon;

  // Hiển thị ảnh nếu có URL avatar và ảnh chưa bị lỗi
  const showImage = Boolean(avatar) && !imgError;

  return (
    <div className="card bg-base-100 border border-base-200/80 rounded-2xl shadow-xs overflow-hidden mb-6">
      {/* Decorative Top Banner */}
      <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-primary via-primary/80 to-secondary relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
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

        {/* User Info & Role Badge */}
        <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight">
                {fullName}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentRole.badgeClass}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                {currentRole.label}
              </span>
            </div>

            {/* Extra text (e.g. email, Headline or Position) */}
            {extra && (
              <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-xl">
                {extra}
              </p>
            )}
          </div>

          {/* Quick Edit button */}
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="btn btn-outline btn-sm rounded-xl text-xs font-semibold self-start sm:self-auto"
            >
              Chỉnh sửa thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
