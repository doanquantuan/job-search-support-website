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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">

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
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Công cụ dropdown */}
          <div className="relative" ref={toolMenuRef}>
            <button
              onClick={() => setToolMenuOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Công cụ
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  toolMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Đánh giá lương
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Trắc nghiệm nghề nghiệp
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Tính lương Gross / Net
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ── Right Section ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Bell */}
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {notifCount}
              </span>
            )}
          </button>

          {/* Messages */}
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* User Avatar + Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Avatar circle */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold select-none">
                  {initials}
                </div>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.fullName || "Người dùng"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/cvs"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    CV của tôi
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Cài đặt tài khoản
                  </Link>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

