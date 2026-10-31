import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  Briefcase,
  Bookmark,
  Bell,
  Building2,
  MessageSquare,
  Settings,
  Lock,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { profileService } from "../../features/profile/services/profile.service";
import { cvService } from "../../features/profile/services/cv.service";

export const ProfileSidebar = ({
  profileData = null,
  cvCount: externalCvCount = null,
  completenessPercent = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [userInfo, setUserInfo] = useState({
    fullName: user?.fullName || "Nguyễn Văn A",
//    headline: "Frontend Developer",
    avatar: user?.avatar || null,
  });

  const [cvCount, setCvCount] = useState(externalCvCount ?? 0);
  const [allowSearch, setAllowSearch] = useState(true);

  // Sync profile data if passed from parent
  useEffect(() => {
    if (profileData) {
      setUserInfo((prev) => ({
        ...prev,
        fullName: profileData.fullName || prev.fullName,
        avatar: profileData.avatar !== undefined ? profileData.avatar : prev.avatar,
        headline:
          profileData.position ||
          profileData.headline ||
          profileData.careerPreference?.expectedPosition ||
          prev.headline,
      }));
      if (profileData.jobSearchStatus) {
        setAllowSearch(profileData.jobSearchStatus !== "NOT_LOOKING");
      }
    }
  }, [profileData]);

  // Sync external CV count or fetch if not provided
  useEffect(() => {
    if (externalCvCount !== null && externalCvCount !== undefined) {
      setCvCount(externalCvCount);
    } else {
      cvService
        .getCvs()
        .then((data) => {
          if (Array.isArray(data)) {
            setCvCount(data.length);
          }
        })
        .catch(() => {});
    }
  }, [externalCvCount]);

  // Fetch basic info if not provided
  useEffect(() => {
    if (!profileData) {
      profileService
        .getJobSeekerMe()
        .then((res) => {
          if (res) {
            setUserInfo((prev) => ({
              ...prev,
              fullName: res.fullName || prev.fullName,
              avatar: res.avatar || prev.avatar,
            }));
            if (res.jobSearchStatus) {
              setAllowSearch(res.jobSearchStatus !== "NOT_LOOKING");
            }
          }
        })
        .catch(() => {});
    }
  }, [profileData]);

  const handleToggleAllowSearch = async () => {
    const nextState = !allowSearch;
    setAllowSearch(nextState);
    try {
      await profileService.updateJobSeekerMe({
        jobSearchStatus: nextState ? "LOOKING" : "NOT_LOOKING",
      });
    } catch (error) {
      console.warn("Failed to update job seeking status:", error);
      // rollback if failed
      setAllowSearch(!nextState);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get initials for avatar fallback (e.g., "Nguyễn Văn A" -> "NA")
  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Navigation items structure matching design
  const navSections = [
    {
      title: "Cá nhân",
      items: [
        {
          key: "profile",
          label: "Hồ sơ cá nhân",
          icon: User,
          path: "/profile",
          badge: null,
        },
        {
          key: "cvs",
          label: "CV của tôi",
          icon: FileText,
          path: "/cvs",
          badge: null,
        },
      ],
    },
    {
      title: "Tìm việc",
      items: [
        {
          key: "my-jobs",
          label: "Việc làm của tôi",
          icon: Briefcase,
          path: "/jobs/applied",
          badge: null,
        },
        {
          key: "saved-jobs",
          label: "Việc làm đã lưu",
          icon: Bookmark,
          path: "/jobs/saved",
          badge: null,
        },
        {
          key: "job-alerts",
          label: "Thông báo việc làm",
          icon: Bell,
          path: "/jobs/alerts",
          badge: null,
        },
        {
          key: "following-companies",
          label: "Công ty đang theo dõi",
          icon: Building2,
          path: "/companies/following",
          badge: null,
        },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        {
          key: "messages",
          label: "Tin nhắn",
          icon: MessageSquare,
          path: "/messages",
          badge: null,
        },
        {
          key: "account-settings",
          label: "Cài đặt tài khoản",
          icon: Settings,
          path: "/settings",
          badge: null,
        },
        {
          key: "privacy",
          label: "Quyền riêng tư",
          icon: Lock,
          path: "/privacy",
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-6 self-start">
      {/* 1. User Header & Progress */}
      {/* <div className="space-y-4">
        <div className="flex items-center gap-3">
          {userInfo.avatar ? (
            <img
              src={userInfo.avatar}
              alt={userInfo.fullName}
              className="w-12 h-12 rounded-full object-cover border border-blue-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm tracking-wide">
              {getInitials(userInfo.fullName)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900 truncate">
              {userInfo.fullName}
            </h2>
            <p className="text-xs text-gray-500 truncate">{userInfo.headline}</p>
          </div>
        </div> */}

        {/* Progress bar */}
        {/* <div className="space-y-1.5 pt-1">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${completenessPercent}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-600">
            Hồ sơ hoàn thiện {completenessPercent}%
          </p>
        </div>
      </div> */}

      {/* 2. Navigation Sections */}
      <nav className="space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider">
              {section.title}
            </h3>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gray-100/90 text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-gray-900" : "text-gray-500"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Recruiter Search Toggle Box */}
      <div className="rounded-xl border border-dashed border-gray-200 p-3.5 bg-gray-50/50 space-y-2.5">
        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          Hồ sơ đang bật: Cho phép nhà tuyển dụng tìm thấy
        </p>

        {/* Custom Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleAllowSearch}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
            allowSearch ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
              allowSearch ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* 4. Logout Button */}
      <div className="pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;

