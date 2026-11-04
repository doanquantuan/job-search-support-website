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
import { getInitials } from "@/lib/utils";

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
          label: "Việc làm đã ứng tuyển",
          icon: Briefcase,
          path: "/my-applications",
          badge: null,
        },
        {
          key: "saved-jobs",
          label: "Việc làm đã lưu",
          icon: Bookmark,
          path: "/saved",
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
    <aside className="card w-full lg:w-72 flex-shrink-0 bg-base-100 rounded-box border border-base-200 shadow-sm p-5 space-y-6 self-start">
      {/* 1. User Header & Progress */}


      {/* 2. Navigation Sections */}
      <nav className="space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="menu-title text-xs font-semibold text-base-content/50 px-3 uppercase tracking-wider">
              {section.title}
            </h3>

            <ul className="menu menu-sm p-0 gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-btn text-sm transition-all ${
                        isActive
                          ? "bg-primary text-white font-bold shadow-xs hover:bg-primary hover:text-white"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? "text-white" : "text-base-content/50"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span className={`badge badge-sm font-semibold ${
                          isActive ? "bg-white text-primary border-none" : "badge-primary"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 3. Recruiter Search Toggle Box */}
      <div className="rounded-box border border-dashed border-base-300 p-3.5 bg-base-200/50 space-y-2.5">
        <p className="text-xs text-base-content/70 leading-relaxed font-medium">
          Hồ sơ đang bật: Cho phép nhà tuyển dụng tìm thấy
        </p>

        {/* daisyUI Toggle Switch */}
        <input
          type="checkbox"
          checked={allowSearch}
          onChange={handleToggleAllowSearch}
          className="toggle toggle-primary toggle-sm"
        />
      </div>

      {/* 4. Logout Button */}
      <div className="pt-1 border-t border-base-200">
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost btn-sm w-full justify-start gap-3 px-3.5 text-sm font-semibold text-base-content/70 hover:text-error hover:bg-error/10 rounded-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
