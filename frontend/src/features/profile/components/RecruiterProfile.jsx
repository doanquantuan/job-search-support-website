import React from "react";
import { CheckCircle2, Clock, Building2, Briefcase, Mail } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";

export const RecruiterProfile = ({
  recruiterInfo,
  companyInfo,
}) => {
  const isVerified = Boolean(recruiterInfo?.isVerified);

  const renderVerificationBadge = () => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-btn text-xs font-semibold bg-success/10 text-success border border-success/20 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          Đã xác minh
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-btn text-xs font-semibold bg-warning/10 text-warning border border-warning/20 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-warning" />
        Chờ xác minh
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <ProfileHeader
        avatar={recruiterInfo?.avatar}
        fullName={recruiterInfo?.fullName || "Trần Hoàng Nam"}
        role="RECRUITER"
        extra={renderVerificationBadge()}
      />

      {/* 2. Main Card: Hồ sơ nhà tuyển dụng */}
      <div className="card bg-base-100 p-6 sm:p-7 border border-base-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-base-content tracking-tight">
            Hồ sơ nhà tuyển dụng
          </h2>
        </div>

        {/* Thông tin nghề nghiệp */}
        <div className="p-5 rounded-box border border-base-200 bg-base-200/40 space-y-3.5">
          <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-secondary" />
            Thông tin nghề nghiệp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
            <div className="pl-3 border-l-2 border-secondary/30">
              <p className="text-2xs text-base-content/50 uppercase font-semibold">Chức vụ</p>
              <p className="font-semibold text-base-content mt-0.5">
                {recruiterInfo?.position || "Chuyên viên tuyển dụng"}
              </p>
            </div>

            <div className="pl-3 border-l-2 border-secondary/30">
              <p className="text-2xs text-base-content/50 uppercase font-semibold">Email</p>
              <p className="font-semibold text-base-content mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-base-content/50" />
                {recruiterInfo?.email || "hoangnam@techflow.example"}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin công ty hoặc Banner chưa liên kết */}
        {recruiterInfo?.companyId ? (
          <div className="p-5 rounded-box border border-base-200 bg-base-200/40 space-y-3.5">
            <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              Thông tin công ty
            </h3>

            {companyInfo ? (
              <div className="space-y-3 text-xs sm:text-sm pt-1">
                <div className="pl-3 border-l-2 border-accent/30">
                  <p className="text-2xs text-base-content/50 uppercase font-semibold">Tên công ty</p>
                  <p className="font-semibold text-base-content mt-0.5">
                    {companyInfo.name || "TechFlow Corporation"}
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-accent/30">
                  <p className="text-2xs text-base-content/50 uppercase font-semibold">Địa chỉ</p>
                  <p className="font-medium text-base-content/80 mt-0.5">
                    {companyInfo.address || "Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh"}
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-accent/30">
                  <p className="text-2xs text-base-content/50 uppercase font-semibold">Lĩnh vực</p>
                  <p className="font-medium text-base-content/80 mt-0.5">
                    {companyInfo.industry || "Công nghệ thông tin & Phần mềm"}
                  </p>
                </div>
              </div>
            ) : (
              /* Skeleton preview while loading company */
              <div className="space-y-3 pt-1">
                <div className="pl-3 border-l-2 border-accent/30 space-y-1">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-4 w-48" />
                </div>
                <div className="pl-3 border-l-2 border-accent/30 space-y-1">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-4 w-64" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NoCompanyBanner (matching Image 3) */
          <div className="alert alert-warning rounded-box flex items-start gap-3.5">
            <div className="p-2 bg-warning/20 rounded-btn flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>

            <div className="text-xs sm:text-sm">
              <h4 className="font-bold mb-1">Chưa liên kết công ty</h4>
              <p className="opacity-90 leading-relaxed">
                Tài khoản của bạn chưa được gán vào công ty nào. Vui lòng liên hệ Admin để được xác minh và liên kết.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
