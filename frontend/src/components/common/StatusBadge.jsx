import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Eye,
  Calendar,
  Award,
  PauseCircle,
  Archive,
} from "lucide-react";

const STATUS_CONFIGS = {
  // ── Job Post Statuses ──
  PUBLISHED: {
    label: "Đang tuyển",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
    icon: CheckCircle2,
  },
  DRAFT: {
    label: "Bản nháp",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
    icon: Clock,
  },
  CLOSED: {
    label: "Đã đóng nhận đơn",
    color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    dotColor: "bg-slate-500",
    icon: PauseCircle,
  },
  EXPIRED: {
    label: "Hết hạn tuyển",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
    icon: Archive,
  },

  // ── Verification Statuses ──
  APPROVED: {
    label: "Đã xác thực",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Đang chờ duyệt",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
    icon: Clock,
  },
  REJECTED: {
    label: "Bị từ chối",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
    icon: XCircle,
  },

  // ── ATS Application Statuses ──
  APPLIED: {
    label: "Mới nộp",
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
    icon: FileText,
  },
  VIEWED: {
    label: "Đã xem",
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
    icon: Eye,
  },
  REVIEWING: {
    label: "Đang đánh giá",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
    icon: Clock,
  },
  INTERVIEW: {
    label: "Mời phỏng vấn",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
    icon: Calendar,
  },
  HIRED: {
    label: "Trúng tuyển",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
    icon: Award,
  },
};

export const StatusBadge = ({
  status = "DRAFT",
  size = "md", // "sm" | "md" | "lg"
  withDot = true,
  withIcon = true,
  className = "",
  customLabel,
}) => {
  const normKey = (status || "").toUpperCase();
  const config = STATUS_CONFIGS[normKey] || {
    label: status || "Không rõ",
    color: "bg-base-200 text-base-content/70 border-base-300",
    dotColor: "bg-base-content/40",
    icon: AlertCircle,
  };

  const Icon = config.icon;
  const label = customLabel || config.label;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-2xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs select-none ${config.color} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
        />
      )}
      {withIcon && Icon && <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} />}
      <span className="truncate">{label}</span>
    </motion.span>
  );
};

export default StatusBadge;
