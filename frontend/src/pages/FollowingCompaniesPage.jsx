import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeInUp,
  fadeInDown,
  slideInLeft,
  staggerContainer,
  listItemEnter,
} from "@/lib/motionVariants";
import {
  Building2,
  Heart,
  MapPin,
  Briefcase,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Bell,
  HeartOff,
} from "lucide-react";

import { useCompanyStore } from "../store/useCompanyStore";
import { AppHeader } from "../components/common/AppHeader";
import { AppFooter } from "../components/common/AppFooter";
import { ProfileSidebar } from "../components/common/ProfileSidebar";
import { Toast } from "../components/common/Toast";

export const FollowingCompaniesPage = () => {
  const navigate = useNavigate();
  const {
    followingList,
    followingLoading,
    fetchFollowingCompaniesPage,
    toggleFollowCompany,
  } = useCompanyStore();

  const [keyword, setKeyword] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmUnfollowId, setConfirmUnfollowId] = useState(null);

  const loadData = useCallback(() => {
    fetchFollowingCompaniesPage({ limit: 100 });
  }, [fetchFollowingCompaniesPage]);

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadData]);

  const handleUnfollow = async (company) => {
    const compId = company.companyId || company.id;
    const compName = company.companyName || company.name || "Công ty";
    await toggleFollowCompany(compId, compName);
    setConfirmUnfollowId(null);
    setToast({
      type: "info",
      message: `Đã hủy theo dõi ${compName}. Bạn sẽ không còn nhận thông báo tuyển dụng từ công ty này.`,
    });
  };

  const filteredCompanies = (followingList || []).filter((item) => {
    if (!keyword.trim()) return true;
    const term = keyword.toLowerCase();
    const name = (item.companyName || item.name || "").toLowerCase();
    const industry = (item.industry || "").toLowerCase();
    const address = (item.address || item.province || "").toLowerCase();
    return name.includes(term) || industry.includes(term) || address.includes(term);
  });

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col font-sans">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Header */}
      <AppHeader />

      {/* Page Container */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-72 flex-shrink-0 self-start"
          >
            <ProfileSidebar />
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Header Title & Actions */}
            <motion.div
              variants={fadeInDown}
              custom={0.08}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
            >
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight flex items-center gap-2.5">
                  <Heart className="w-6 h-6 text-error fill-error/20" />
                  Công ty đang theo dõi
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                  Nhận thông báo tuyển dụng tức thì khi các doanh nghiệp yêu thích đăng việc làm mới ({filteredCompanies.length} công ty)
                </p>
              </div>

              {/* Refresh button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={loadData}
                disabled={followingLoading}
                className="btn btn-outline btn-sm h-9 min-h-9 gap-1.5 text-xs font-medium self-start sm:self-auto"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${followingLoading ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </motion.button>
            </motion.div>

            {/* Notification feature banner */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3.5 text-primary text-xs sm:text-sm"
            >
              <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Tính năng thông báo tự động:</span> Khi bạn theo dõi một doanh nghiệp, hệ thống sẽ tự động gửi thông báo chuông và thông báo đẩy theo thời gian thực tới bạn mỗi khi công ty đó phát hành việc làm mới.
              </div>
            </motion.div>

            {/* Search Filter Bar */}
            <motion.div
              variants={fadeInUp}
              custom={0.12}
              initial="hidden"
              animate="visible"
              className="bg-base-100 rounded-2xl border border-base-200/80 p-3 sm:p-4 shadow-xs"
            >
              <label className="input input-bordered input-sm sm:input-md flex items-center gap-2.5 w-full rounded-xl bg-base-200/30 focus-within:bg-base-100">
                <Search className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm theo tên công ty, ngành nghề hoặc địa điểm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="grow bg-transparent text-xs sm:text-sm focus:outline-hidden"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="text-xs text-base-content/40 hover:text-base-content cursor-pointer shrink-0"
                  >
                    Xóa
                  </button>
                )}
              </label>
            </motion.div>

            {/* Content List Area */}
            {followingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-base-100 rounded-2xl border border-base-200 p-5 flex items-center gap-4 animate-pulse"
                  >
                    <div className="w-14 h-14 rounded-xl bg-base-300 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-base-300 rounded w-1/3" />
                      <div className="h-4 bg-base-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCompanies.length === 0 ? (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-base-100 rounded-2xl border border-base-200/80 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4">
                  <HeartOff className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-base-content">
                  {keyword ? "Không tìm thấy công ty phù hợp" : "Bạn chưa theo dõi công ty nào"}
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-md mt-1.5 mb-6">
                  {keyword
                    ? `Không có kết quả nào khớp với "${keyword}". Hãy thử tìm kiếm với từ khóa khác.`
                    : "Theo dõi các doanh nghiệp bạn quan tâm để cập nhật nhanh nhất các vị trí việc làm mới và thông tin tuyển dụng hữu ích."}
                </p>
                <Link
                  to="/companies"
                  className="btn btn-primary btn-sm sm:btn-md rounded-xl text-white font-medium gap-2 px-6 shadow-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Khám phá công ty ngay</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <AnimatePresence>
                  {filteredCompanies.map((company) => {
                    const compId = company.companyId || company.id;
                    const compName = company.companyName || company.name || "Doanh nghiệp";
                    const logoUrl = company.logo || company.logoUrl;
                    const activeJobs = company.activeJobsCount || 0;
                    const isConfirming = confirmUnfollowId === compId;

                    return (
                      <motion.div
                        key={compId}
                        variants={listItemEnter}
                        layout
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-base-100 rounded-2xl border border-base-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        {/* Company Header */}
                        <div
                          onClick={() => navigate(`/companies/${compId}`)}
                          className="flex items-start gap-3.5 cursor-pointer group/item"
                        >
                          {/* Logo */}
                          <div className="w-14 h-14 rounded-xl border border-base-200 bg-base-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/item:border-primary/40 transition-colors">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={compName}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 className="w-7 h-7 text-base-content/30" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span
                              className="font-bold text-sm sm:text-base text-base-content group-hover/item:text-primary transition-colors line-clamp-1 block"
                              title={compName}
                            >
                              {compName}
                            </span>
                            {company.industry && (
                              <p className="text-xs text-base-content/60 line-clamp-1 mt-0.5">
                                {company.industry}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {(company.province || company.address) && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-base-content/70 bg-base-200/60 px-2 py-0.5 rounded-md">
                                  <MapPin className="w-3 h-3 text-base-content/50" />
                                  <span className="line-clamp-1">{company.province || company.address}</span>
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                <Briefcase className="w-3 h-3" />
                                <span>{activeJobs} việc làm đang tuyển</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-base-200/60">
                          {isConfirming ? (
                            <div className="flex items-center gap-2 w-full justify-between animate-fadeIn">
                              <span className="text-xs text-error font-medium">Bỏ theo dõi công ty này?</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUnfollow(company)}
                                  className="btn btn-error btn-xs rounded-lg text-white font-bold"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => setConfirmUnfollowId(null)}
                                  className="btn btn-ghost btn-xs rounded-lg"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmUnfollowId(compId)}
                                className="btn btn-ghost btn-xs sm:btn-sm text-error/80 hover:text-error hover:bg-error/10 rounded-xl gap-1.5 font-medium"
                                title="Bỏ theo dõi"
                              >
                                <HeartOff className="w-3.5 h-3.5" />
                                <span>Bỏ theo dõi</span>
                              </button>

                              <Link
                                to={`/companies/${compId}`}
                                className="btn btn-primary btn-outline btn-xs sm:btn-sm rounded-xl gap-1.5 font-bold"
                              >
                                <span>Xem công ty</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default FollowingCompaniesPage;
