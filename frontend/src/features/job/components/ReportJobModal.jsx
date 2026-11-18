import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  Send,
  Building2,
  Briefcase,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useJobReportStore, REPORT_REASONS } from '@/store/useJobReportStore';

export const ReportJobModal = () => {
  const {
    isReportModalOpen,
    selectedJob,
    reason,
    description,
    submitting,
    closeReportModal,
    setReason,
    setDescription,
    submitReport,
  } = useJobReportStore();

  if (!isReportModalOpen || !selectedJob) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReport();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeReportModal}
          className="fixed inset-0 bg-neutral/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-base-100 rounded-3xl shadow-2xl border border-base-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-base-200 bg-base-100 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0 ring-4 ring-error/5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-base-content">
                  Báo cáo tin tuyển dụng
                </h3>
                <p className="text-2xs sm:text-xs text-base-content/60">
                  Góp phần xây dựng môi trường việc làm minh bạch, uy tín
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeReportModal}
              disabled={submitting}
              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-base-content/60 hover:text-base-content"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Tóm tắt tin tuyển dụng đang báo cáo */}
            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <span className="line-clamp-1">{selectedJob.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-base-content/70">
                <Building2 className="w-3 h-3 text-base-content/50" />
                <span>{selectedJob.companyName}</span>
              </div>
            </div>

            {/* Chọn lý do vi phạm */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1">
                <span>Lý do báo cáo vi phạm</span>
                <span className="text-error">*</span>
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map((item) => {
                  const isChecked = reason === item.id;
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-error/40 bg-error/5 text-base-content shadow-xs'
                          : 'border-base-200 hover:border-base-300 hover:bg-base-200/40 text-base-content/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={item.id}
                        checked={isChecked}
                        onChange={() => setReason(item.id)}
                        className="radio radio-error radio-sm mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold leading-snug">{item.label}</p>
                        <p className="text-2xs text-base-content/60 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content uppercase tracking-wider">
                Mô tả chi tiết bằng chứng (tùy chọn)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Công ty này nhắn tin qua Zalo yêu cầu nộp 200.000đ tiền mở tài khoản..."
                className="textarea textarea-bordered w-full text-xs focus:textarea-error leading-relaxed rounded-2xl"
              />
              <p className="text-2xs text-base-content/50">
                Cung cấp chi tiết sẽ giúp Ban quản trị xử lý và gỡ tin vi phạm nhanh hơn.
              </p>
            </div>

            {/* Cảnh báo quy định */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-warning/10 border border-warning/20 text-warning-content">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-2xs leading-relaxed text-base-content/80">
                Hệ thống chỉ tiếp nhận các phản ánh có thật. Các hành vi cố ý báo cáo sai sự thật
                nhằm phá hoại có thể bị khóa tài khoản vĩnh viễn.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={closeReportModal}
                disabled={submitting}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-error btn-sm rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{submitting ? 'Đang gửi...' : 'Gửi báo cáo vi phạm'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportJobModal;
