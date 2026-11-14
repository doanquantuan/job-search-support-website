import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  User,
  ChevronDown,
  LogOut,
  Sparkles,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Briefcase,
  Bookmark,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import logo from "@/assets/logo.png";

export const RecruiterHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const userMenuRef = useRef(null);

  const isRecruiter = user?.role === "RECRUITER";
  const initials = getInitials(user?.fullName);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  // Đóng dropdown người dùng khi click bên ngoài
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/recruiter");
  };

  // Cuộn mượt đến section tương ứng trên trang giải pháp
  const scrollToSection = (sectionId) => {
    if (location.pathname === "/recruiter") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/recruiter#${sectionId}`);
  };

  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 shadow-xs min-h-14 py-0 px-0">
      <div className="max-w-8xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* ── Logo JobLink đồng nhất với AppHeader ── */}
        <Link to="/recruiter" className="flex items-center shrink-0 mr-2">
          <img src={logo} alt="JobLink" className="h-20 w-auto" />
        </Link>

        {/* ── Primary Nav: "Giải pháp", "Liên hệ", và "Bảng quản trị" nếu đã đăng nhập ── */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {user && isRecruiter && (
            <Link
              to="/recruiter/dashboard"
              className="px-3 py-4 text-sm font-semibold text-primary hover:text-primary-focus transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bảng quản trị</span>
            </Link>
          )}

          {/* 1. Giải pháp tuyển dụng */}
          <button
            type="button"
            onClick={() => scrollToSection("solutions")}
            className={`relative px-3 py-4 text-sm font-medium transition-colors cursor-pointer ${
              location.pathname === "/recruiter"
                ? "text-primary font-semibold"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <span>Giải pháp</span>
            {location.pathname === "/recruiter" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>

          {/* 2. Liên hệ */}
          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            className="px-3 py-4 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
          >
            Liên hệ
          </button>
        </nav>

        {/* ── Right Section ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto">
          {/* 1. Đăng nhập / Đăng ký hoặc User Menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`btn btn-ghost btn-sm h-10 pl-1 pr-2 rounded-full gap-1.5 group transition-colors ${
                  userMenuOpen ? "bg-base-200" : "hover:bg-base-200"
                }`}
                aria-expanded={userMenuOpen}
                title="Menu nhà tuyển dụng"
              >
                {/* Avatar circle */}
                {user?.avatar && !avatarError ? (
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full ring-2 ring-primary/20 overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold select-none flex items-center justify-center shadow-xs ring-2 ring-base-100 group-hover:ring-primary/40 transition-all">
                      <span className="text-white font-bold">{initials}</span>
                    </div>
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-base-content line-clamp-1 max-w-[110px]">
                    {user?.fullName || "Nhà tuyển dụng"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-base-content/60 group-hover:text-base-content transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-base-100 rounded-box border border-base-200 shadow-xl py-1 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-base-200 flex items-center gap-3">
                    {user?.avatar && !avatarError ? (
                      <div className="avatar">
                        <div className="w-9 h-9 rounded-full ring-1 ring-base-300 overflow-hidden">
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full"
                            onError={() => setAvatarError(true)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold select-none flex items-center justify-center shadow-xs">
                          <span className="text-white font-bold">{initials}</span>
                        </div>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-base-content truncate">
                        {user?.fullName || "Nhà tuyển dụng"}
                      </p>
                      <p className="text-xs text-base-content/60 truncate mt-0.5">
                        {user?.email || ""}
                      </p>
                      <span className="badge badge-primary text-white text-2xs font-bold mt-1 py-0.5 px-2">
                        {isRecruiter ? "Doanh nghiệp" : "Ứng viên"}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <ul className="menu menu-sm p-1.5">
                    {isRecruiter ? (
                      <>
                        <li>
                          <Link
                            to="/recruiter/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <LayoutDashboard className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Bảng quản trị tuyển dụng</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/recruiter/company"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <Building2 className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Thông tin công ty</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/recruiter/verification"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <ShieldCheck className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Xác thực doanh nghiệp</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <User className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Hồ sơ nhà tuyển dụng</span>
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              scrollToSection("solutions");
                            }}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn w-full text-left"
                          >
                            <Sparkles className="w-4 h-4 text-warning group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Gói giải pháp & Báo giá</span>
                          </button>
                        </li>
                        <li>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <Settings className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Cài đặt tài khoản</span>
                          </Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <User className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Hồ sơ cá nhân</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/cvs"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <FileText className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>CV của tôi</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/my-applications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <Briefcase className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Việc làm đã ứng tuyển</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/saved"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <Bookmark className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Việc làm đã lưu</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                          >
                            <Settings className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                            <span>Cài đặt tài khoản</span>
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>

                  <div className="border-t border-base-200 p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-ghost btn-sm w-full justify-start gap-3 text-error hover:bg-error hover:text-white font-medium transition-colors group rounded-btn"
                    >
                      <LogOut className="w-4 h-4 text-error group-hover:text-white transition-colors" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/recruiter/login"
                className="btn btn-ghost btn-sm h-9 min-h-9 px-4 text-xs font-semibold text-base-content"
              >
                Đăng nhập
              </Link>
              <Link
                to="/recruiter/register"
                className="btn btn-primary btn-sm h-9 min-h-9 px-4 text-xs font-semibold text-white shadow-xs"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* 2. Phân cách đứng đồng bộ AppHeader */}
          <div className="h-6 w-px bg-base-300 mx-1 hidden sm:block" />

          {/* 3. Nút Dành cho Người tìm việc ở ngoài cùng bên phải */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all hover:shadow-md shrink-0 border border-slate-700/60 group cursor-pointer"
            title="Quay lại trang tìm việc làm dành cho Ứng viên"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Dành cho Người tìm việc</span>
            <span className="sm:hidden">Tìm việc</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default RecruiterHeader;
