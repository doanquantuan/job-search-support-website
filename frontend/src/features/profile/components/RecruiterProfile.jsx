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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Đã xác minh
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
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
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Hồ sơ nhà tuyển dụng
          </h2>
        </div>

        {/* Thông tin nghề nghiệp */}
        <div className="p-5 rounded-xl border border-gray-100 bg-slate-50/40 space-y-3.5">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            Thông tin nghề nghiệp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
            <div className="pl-3 border-l-2 border-purple-200">
              <p className="text-2xs text-gray-400 uppercase font-semibold">Chức vụ</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {recruiterInfo?.position || "Chuyên viên tuyển dụng"}
              </p>
            </div>

            <div className="pl-3 border-l-2 border-purple-200">
              <p className="text-2xs text-gray-400 uppercase font-semibold">Email</p>
              <p className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {recruiterInfo?.email || "hoangnam@techflow.example"}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin công ty hoặc Banner chưa liên kết */}
        {recruiterInfo?.companyId ? (
          <div className="p-5 rounded-xl border border-gray-100 bg-slate-50/40 space-y-3.5">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Thông tin công ty
            </h3>

            {companyInfo ? (
              <div className="space-y-3 text-xs sm:text-sm pt-1">
                <div className="pl-3 border-l-2 border-indigo-200">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Tên công ty</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {companyInfo.name || "TechFlow Corporation"}
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-indigo-200">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Địa chỉ</p>
                  <p className="font-medium text-gray-700 mt-0.5">
                    {companyInfo.address || "Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh"}
                  </p>
                </div>
                <div className="pl-3 border-l-2 border-indigo-200">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Lĩnh vực</p>
                  <p className="font-medium text-gray-700 mt-0.5">
                    {companyInfo.industry || "Công nghệ thông tin & Phần mềm"}
                  </p>
                </div>
              </div>
            ) : (
              /* Skeleton preview while loading company */
              <div className="space-y-3 pt-1 animate-pulse">
                <div className="pl-3 border-l-2 border-indigo-200 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
                <div className="pl-3 border-l-2 border-indigo-200 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-64" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NoCompanyBanner (matching Image 3) */
          <div className="p-4 sm:p-5 rounded-xl border border-amber-300 bg-amber-50/60 flex items-start gap-3.5 text-amber-900 transition-all">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>

            <div className="text-xs sm:text-sm">
              <h4 className="font-bold text-amber-900 mb-1">Chưa liên kết công ty</h4>
              <p className="text-amber-800/90 leading-relaxed">
                Tài khoản của bạn chưa được gán vào công ty nào. Vui lòng liên hệ Admin để được xác minh và liên kết.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
