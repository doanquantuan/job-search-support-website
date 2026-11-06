import React from "react";
import { motion } from "framer-motion";
import { Inbox, Plus } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "Không tìm thấy dữ liệu",
  description = "Hiện tại chưa có mục nào phù hợp với tiêu chí của bạn.",
  actionText,
  onAction,
  actionIcon: ActionIcon = Plus,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-base-100 rounded-2xl border border-dashed border-base-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-base-200/80 text-base-content/50 flex items-center justify-center shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="font-bold text-base text-base-content">{title}</h4>
        {description && (
          <p className="text-sm text-base-content/60 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="btn btn-primary btn-sm text-white shadow-xs gap-1.5"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            <span>{actionText}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
