import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FilePlus2,
  Briefcase,
  Users,
  BarChart3,
  Building2,
  ShieldCheck,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { companyApi } from "@/features/company/services/companyApi";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const NAV_ITEMS = [
  {
    to: "/recruiter/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    to: "/recruiter/jobs/create",
    label: "Đăng tin mới",
    icon: FilePlus2,
    badge: null,
  },
  {
    to: "/recruiter/jobs",
    label: "Quản lý tin đăng",
    icon: Briefcase,
    badge: null,
  },
  {
    to: "/recruiter/applications",
    label: "Hồ sơ ứng viên (ATS)",
    icon: Users,
    badge: null,
  },
  {
    to: "/recruiter/analytics",
    label: "Báo cáo & Thống kê",
    icon: BarChart3,
    badge: null,
  },
  {
    to: "/recruiter/company",
    label: "Thông tin công ty",
    icon: Building2,
    badge: null,
  },
  {
    to: "/recruiter/verification",
    label: "Xác thực doanh nghiệp",
    icon: ShieldCheck,
    badge: null,
  },
];

export const RecruiterDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState(null);

  useEffect(() => {
    // Tự động đóng mobile sidebar khi đổi route
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Tải thông tin xác thực doanh nghiệp để hiển thị badge
    companyApi
      .getVerificationStatus()
      .then((data) => setVerificationInfo(data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/recruiter/login");
  };

  const isVerified = verificationInfo?.verificationStatus === "APPROVED";
  const isPending = verificationInfo?.verificationStatus === "PENDING";
  const isRejected = verificationInfo?.verificationStatus === "REJECTED";

  // Tạo breadcrumbs từ URL
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/recruiter/dashboard") return [{ label: "Tổng quan", to: "/recruiter/dashboard" }];
    if (path === "/recruiter/jobs/create") return [{ label: "Tin tuyển dụng", to: "/recruiter/jobs" }, { label: "Đăng tin mới" }];
    if (path === "/recruiter/jobs") return [{ label: "Tin tuyển dụng", to: "/recruiter/jobs" }, { label: "Danh sách tin" }];
    if (path.includes("/recruiter/jobs/") && path.includes("/edit")) return [{ label: "Tin tuyển dụng", to: "/recruiter/jobs" }, { label: "Chỉnh sửa tin" }];
    if (path === "/recruiter/applications") return [{ label: "Tuyển dụng (ATS)", to: "/recruiter/applications" }, { label: "Danh sách hồ sơ" }];
    if (path === "/recruiter/analytics") return [{ label: "Thống kê", to: "/recruiter/analytics" }, { label: "Báo cáo tuyển dụng" }];
    if (path === "/recruiter/company") return [{ label: "Doanh nghiệp", to: "/recruiter/company" }, { label: "Thông tin công ty" }];
    if (path === "/recruiter/verification") return [{ label: "Doanh nghiệp", to: "/recruiter/company" }, { label: "Xác thực tài khoản" }];
    return [{ label: "Nhà tuyển dụng", to: "/recruiter" }];
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = getInitials(user?.fullName || "Recruiter");

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col font-sans text-base-content antialiased">
      {/* ── Top Navbar ───────────────────────────────────────────────────────── */}
      <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 h-16 px-4 sm:px-6 shadow-2xs">
        <div className="flex-1 flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="btn btn-ghost btn-sm btn-square lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Portal Badge */}
          <Link to="/recruiter/dashboard" className="flex items-center gap-2.5">
            <img src={logo} alt="JobLink" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-primary">
                RECRUITER
              </span>
              <span className="text-[10px] text-base-content/60 font-medium tracking-wide uppercase mt-0.5">
                Trung tâm tuyển dụng
              </span>
            </div>
          </Link>

          {/* Doanh nghiệp & Trạng thái xác thực */}
          <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-base-300 text-xs">
            <span className="font-semibold text-base-content truncate max-w-[200px]">
              {verificationInfo?.companyName || user?.companyName || "TechFlow Corporation"}
            </span>
            {isVerified && (
              <span className="badge badge-success badge-sm gap-1 text-[10px] font-semibold text-white">
                <CheckCircle2 className="w-3 h-3" />
                Đã xác thực
              </span>
            )}
            {isPending && (
              <span className="badge badge-warning badge-sm gap-1 text-[10px] font-semibold">
                <Clock className="w-3 h-3" />
                Chờ duyệt
              </span>
            )}
            {isRejected && (
              <span className="badge badge-error badge-sm gap-1 text-[10px] font-semibold text-white">
                <AlertTriangle className="w-3 h-3" />
                Cần bổ sung
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick link to Candidate portal */}
          <Link
            to="/jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 btn btn-ghost btn-sm text-xs text-base-content/70 hover:text-primary font-medium"
          >
            <span>Cổng việc làm</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-base-200 transition-colors"
            >
              <div className="avatar placeholder">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content text-xs font-bold">
                  <span>{initials}</span>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-base-content text-left max-w-[120px] truncate">
                {user?.fullName || "Nhà tuyển dụng"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-base-content/60 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-base-100 rounded-box border border-base-200 shadow-xl py-1.5 z-50 text-xs"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-base-200">
                  <p className="font-bold text-sm text-base-content truncate">{user?.fullName || "Nhà tuyển dụng"}</p>
                  <p className="text-base-content/60 truncate mt-0.5">{user?.email || "recruiter@example.com"}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    Doanh nghiệp
                  </span>
                </div>

                <ul className="menu menu-sm p-1.5 space-y-0.5">
                  <li>
                    <Link to="/profile" className="flex items-center gap-2.5 py-2">
                      <User className="w-4 h-4 text-base-content/70" />
                      <span>Hồ sơ nhà tuyển dụng</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/recruiter/company" className="flex items-center gap-2.5 py-2">
                      <Building2 className="w-4 h-4 text-base-content/70" />
                      <span>Thông tin công ty</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/recruiter/verification" className="flex items-center gap-2.5 py-2">
                      <ShieldCheck className="w-4 h-4 text-base-content/70" />
                      <span>Xác thực doanh nghiệp</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="flex items-center gap-2.5 py-2">
                      <Settings className="w-4 h-4 text-base-content/70" />
                      <span>Cài đặt tài khoản</span>
                    </Link>
                  </li>
                </ul>

                <div className="border-t border-base-200 p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost btn-sm w-full justify-start text-error hover:bg-error hover:text-white gap-2.5 font-medium rounded-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body Container with Left Sidebar & Main Content ───────────────────── */}
      <div className="flex-1 flex max-w-8xl w-full mx-auto">
        {/* Backdrop for Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-base-100 border-r border-base-300 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-2 text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
              Menu quản lý
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                // Phân biệt chính xác giữa /recruiter/jobs (danh sách tin) và /recruiter/jobs/create (đăng tin mới)
                const isCurrentActive =
                  item.to === "/recruiter/jobs"
                    ? location.pathname === "/recruiter/jobs" ||
                      (location.pathname.startsWith("/recruiter/jobs/") &&
                        !location.pathname.startsWith("/recruiter/jobs/create"))
                    : item.to === "/recruiter/jobs/create"
                    ? location.pathname === "/recruiter/jobs/create"
                    : item.to === "/recruiter/dashboard"
                    ? location.pathname === "/recruiter/dashboard"
                    : location.pathname === item.to || location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-btn text-xs font-semibold transition-colors duration-150 group overflow-hidden ${
                      isCurrentActive
                        ? "text-primary font-bold bg-primary/10"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
                    }`}
                  >
                    {isCurrentActive && (
                      <motion.div
                        layoutId="recruiterSidebarIndicator"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}

                    <div className="flex items-center gap-3 z-10">
                      <Icon className={`w-4 h-4 transition-colors ${isCurrentActive ? "text-primary" : "text-base-content/60 group-hover:text-base-content"}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`badge badge-xs z-10 font-bold px-1.5 py-0.5 ${item.badgeColor || "badge-neutral"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Action Card */}
          <div className="p-3 border-t border-base-300 bg-base-200/40">
            <div className="card bg-base-100 p-3.5 rounded-box border border-base-300 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-base-content">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Hỗ trợ pháp lý</span>
              </div>
              <p className="text-[11px] text-base-content/60 leading-relaxed">
                Doanh nghiệp cần xác thực đầy đủ để được đăng tin không giới hạn.
              </p>
              <Link
                to="/recruiter/verification"
                className="btn btn-primary btn-outline btn-xs w-full font-semibold"
              >
                Kiểm tra hồ sơ
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col space-y-5">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-base-content/60 pb-1">
            <Link to="/recruiter/dashboard" className="hover:text-primary transition-colors">
              Recruiter
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-base-content/40" />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-primary transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-base-content">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Dynamic Page Outlet with Fade Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboardLayout;
