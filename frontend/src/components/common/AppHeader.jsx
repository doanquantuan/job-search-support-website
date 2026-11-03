import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  User,
  FileText,
  Settings,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/logo.png";

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Việc làm",  to: "/jobs"      },
  { label: "Công ty",   to: "/companies" },
  { label: "Tạo CV",    to: "/cvs"       },
  { label: "Cẩm nang",  to: "/guide"     },
];

// ── AppHeader ────────────────────────────────────────────────────────────────

export const AppHeader = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();

  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [toolMenuOpen,  setToolMenuOpen]  = useState(false);
  const [notifCount]                      = useState(2); // TODO: real API

  const userMenuRef = useRef(null);
  const toolMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (toolMenuRef.current && !toolMenuRef.current.contains(e.target)) {
        setToolMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = getInitials(user?.fullName);

  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 shadow-sm min-h-14 py-0 px-0">
      <div className="max-w-8xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center flex-shrink-0 mr-2">
          <img src={logo} alt="JobLink" className="h-20 w-auto" />
        </Link>

        {/* ── Primary Nav ──────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-4 text-sm font-medium transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Công cụ dropdown */}
          <div className="relative" ref={toolMenuRef}>
            <button
              onClick={() => setToolMenuOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-4 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
            >
              Công cụ
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  toolMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolMenuOpen && (
              <ul className="menu menu-sm absolute top-full left-0 mt-1 w-52 bg-base-100 rounded-box border border-base-200 shadow-lg p-1.5 z-50">
                <li>
                  <button className="text-left text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-colors">
                    Đánh giá lương
                  </button>
                </li>
                <li>
                  <button className="text-left text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-colors">
                    Trắc nghiệm nghề nghiệp
                  </button>
                </li>
                <li>
                  <button className="text-left text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-colors">
                    Tính lương Gross / Net
                  </button>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* ── Right Section ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {/* Bell */}
              <button className="btn btn-ghost btn-circle btn-sm text-base-content/70">
                <div className="indicator">
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="badge badge-error badge-xs indicator-item text-white font-bold">
                      {notifCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Messages */}
              <button className="btn btn-ghost btn-circle btn-sm text-base-content/70">
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* User Avatar + Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`btn btn-ghost btn-sm h-10 pl-1 pr-2 rounded-full gap-1.5 group transition-colors ${
                    userMenuOpen ? "bg-base-200" : "hover:bg-base-200"
                  }`}
                  aria-expanded={userMenuOpen}
                  title="Menu người dùng"
                >
                  {/* Avatar circle */}
                  {user?.avatar ? (
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full ring-2 ring-primary/20">
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-full h-full object-cover rounded-full"
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
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-base-content/60 group-hover:text-base-content transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-base-100 rounded-box border border-base-200 shadow-lg py-1 z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-base-200 flex items-center gap-3">
                      {user?.avatar ? (
                        <div className="avatar">
                          <div className="w-9 h-9 rounded-full ring-1 ring-base-300">
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-full h-full object-cover rounded-full"
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
                          {user?.fullName || "Người dùng"}
                        </p>
                        <p className="text-xs text-base-content/60 truncate mt-0.5">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <ul className="menu menu-sm p-1.5">
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
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 py-2 text-sm text-base-content hover:bg-primary hover:text-white focus:bg-primary focus:text-white active:bg-primary active:text-white group transition-colors rounded-btn"
                        >
                          <Settings className="w-4 h-4 text-base-content/60 group-hover:text-white group-focus:text-white group-active:text-white transition-colors" />
                          <span>Cài đặt tài khoản</span>
                        </Link>
                      </li>
                    </ul>

                    <div className="border-t border-base-200 p-1.5">
                      <button
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn btn-ghost btn-sm h-9 min-h-9 px-4 text-xs font-semibold text-base-content"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm h-9 min-h-9 px-4 text-xs font-semibold text-white shadow-xs"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
