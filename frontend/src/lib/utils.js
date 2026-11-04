/**
 * Shared Utilities for Frontend
 */

/**
 * Lấy chữ cái viết tắt từ tên người hoặc tên công ty để làm avatar fallback
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Định dạng số tiền sang chuẩn Tiếng Việt (VNĐ hoặc triệu)
 * @param {number|string} amount Số tiền tính theo VNĐ
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "Thỏa thuận";
  const num = Number(amount);
  if (isNaN(num)) return String(amount);

  if (num >= 1000000) {
    const inMillions = num / 1000000;
    return `${Number.isInteger(inMillions) ? inMillions : inMillions.toFixed(1)} triệu`;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Định dạng khoảng lương hiển thị
 * @param {number|string} min 
 * @param {number|string} max 
 * @param {string} type 'RANGE' | 'NEGOTIABLE' | 'EXACT'
 * @returns {string}
 */
export const formatSalaryRange = (min, max, type = "RANGE") => {
  if (type === "NEGOTIABLE" || (!min && !max)) return "Thỏa thuận";
  const minM = min ? Number(min) / 1000000 : null;
  const maxM = max ? Number(max) / 1000000 : null;

  if (minM && maxM) {
    return `${Number.isInteger(minM) ? minM : minM.toFixed(1)} – ${Number.isInteger(maxM) ? maxM : maxM.toFixed(1)} triệu`;
  }
  if (minM) return `Từ ${Number.isInteger(minM) ? minM : minM.toFixed(1)} triệu`;
  if (maxM) return `Lên đến ${Number.isInteger(maxM) ? maxM : maxM.toFixed(1)} triệu`;
  return "Thỏa thuận";
};

/**
 * Định dạng ngày theo chuẩn Việt Nam (dd/mm/yyyy)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Định dạng ngày giờ chi tiết (dd/mm/yyyy HH:mm)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Tính khoảng cách thời gian tương đối ("Vừa xong", "5 phút trước", "2 ngày trước", ...)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return "Sắp diễn ra";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) return formatDate(dateInput);
  if (diffDay > 0) return `${diffDay} ngày trước`;
  if (diffHour > 0) return `${diffHour} giờ trước`;
  if (diffMin > 0) return `${diffMin} phút trước`;
  return "Vừa xong";
};

/**
 * Cấu hình hiển thị chuẩn cho trạng thái đơn ứng tuyển (Application Status)
 */
export const APPLICATION_STATUS_CONFIG = {
  APPLIED: {
    label: "Đã nộp hồ sơ",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
    dotClass: "bg-blue-500",
    description: "Hồ sơ của bạn đã được chuyển tới bộ phận tuyển dụng.",
  },
  VIEWED: {
    label: "NTD đã xem hồ sơ",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20",
    dotClass: "bg-purple-500",
    description: "Nhà tuyển dụng đã mở và xem chi tiết hồ sơ ứng tuyển của bạn.",
  },
  REVIEWING: {
    label: "Đang xét duyệt",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    dotClass: "bg-amber-500",
    description: "Hồ sơ đang được phòng ban chuyên môn đánh giá mức độ phù hợp.",
  },
  INTERVIEW: {
    label: "Mời phỏng vấn",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
    dotClass: "bg-emerald-500",
    description: "Bạn đã được chọn vào vòng phỏng vấn! Vui lòng kiểm tra email hoặc điện thoại.",
  },
  HIRED: {
    label: "Trúng tuyển",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500/20",
    dotClass: "bg-teal-500",
    description: "Chúc mừng bạn đã trúng tuyển vị trí này!",
  },
  REJECTED: {
    label: "Chưa phù hợp",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
    dotClass: "bg-rose-500",
    description: "Hồ sơ chưa phù hợp với yêu cầu hiện tại của vị trí này.",
  },
  WITHDRAWN: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/20",
    dotClass: "bg-slate-400",
    description: "Bạn đã chủ động rút hồ sơ ứng tuyển này.",
  },
};
