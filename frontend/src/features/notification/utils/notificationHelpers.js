import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  Bell,
} from "lucide-react";

/**
 * Định dạng thời gian tương đối tiếng Việt ("Vừa xong", "5 phút trước", ...)
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 45) return "Vừa xong";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Trả về metadata hiển thị (icon, màu sắc, nhãn, kiểu toast) cho từng loại thông báo
 */
export const getNotificationVisualMeta = (notification) => {
  const type = notification?.type || "SYSTEM";
  const meta = notification?.metadata || {};

  switch (type) {
    case "COMPANY": {
      const status = meta.verificationStatus || meta.status;
      if (status === "APPROVED" || status === "VERIFIED") {
        return {
          label: "Xác thực công ty",
          Icon: ShieldCheck,
          iconWrapClass: "bg-success/15 text-success border border-success/25",
          badgeClass: "badge-success text-white",
          toastType: "success",
        };
      }
      if (status === "REJECTED" || status === "ADDITIONAL_INFO_REQUIRED") {
        return {
          label: "Xác thực công ty",
          Icon: ShieldAlert,
          iconWrapClass: "bg-warning/15 text-warning border border-warning/30",
          badgeClass: "badge-warning",
          toastType: "warning",
        };
      }
      return {
        label: "Công ty",
        Icon: ShieldCheck,
        iconWrapClass: "bg-primary/10 text-primary border border-primary/20",
        badgeClass: "badge-primary text-white",
        toastType: "info",
      };
    }

    case "APPLICATION":
      return {
        label: "Ứng tuyển",
        Icon: Users,
        iconWrapClass: "bg-info/15 text-info border border-info/25",
        badgeClass: "badge-info text-white",
        toastType: "info",
      };

    case "JOB":
      return {
        label: "Tin tuyển dụng",
        Icon: Briefcase,
        iconWrapClass: "bg-warning/15 text-warning border border-warning/30",
        badgeClass: "badge-warning",
        toastType: "warning",
      };

    case "SECURITY":
      return {
        label: "Bảo mật",
        Icon: AlertTriangle,
        iconWrapClass: "bg-error/15 text-error border border-error/25",
        badgeClass: "badge-error text-white",
        toastType: "warning",
      };

    case "MESSAGE":
      return {
        label: "Tin nhắn",
        Icon: MessageSquare,
        iconWrapClass: "bg-secondary/15 text-secondary border border-secondary/25",
        badgeClass: "badge-secondary text-white",
        toastType: "info",
      };

    case "SYSTEM":
    default:
      return {
        label: "Hệ thống",
        Icon: Bell,
        iconWrapClass: "bg-base-200 text-base-content/70 border border-base-300",
        badgeClass: "badge-ghost",
        toastType: "info",
      };
  }
};

/**
 * Chuẩn hóa đường dẫn điều hướng khi người dùng click vào thông báo
 */
export const resolveNotificationTargetUrl = (notification, userRole) => {
  const rawUrl = notification?.targetUrl;
  if (!rawUrl) {
    return userRole === "RECRUITER" ? "/recruiter/notifications" : "/profile";
  }

  // Tương thích ngược với các bản ghi cũ lưu /recruiter/company/verification
  if (rawUrl === "/recruiter/company/verification") {
    return "/recruiter/verification";
  }

  // Chuyển hướng các đường dẫn ứng tuyển cũ về /my-applications
  if (rawUrl.startsWith("/applications/")) {
    const appId = rawUrl.replace("/applications/", "");
    return `/my-applications?applicationId=${appId}`;
  }
  if (rawUrl === "/applications") {
    return "/my-applications";
  }

  return rawUrl;
};
