import React, { useState } from 'react';
import {
  X,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';

export const JobDetailModal = ({ job, company, isOpen, onClose, onApplySuccess }) => {
  const [applied, setApplied] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplied(true);
      if (onApplySuccess) {
        onApplySuccess(job.title);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-content/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-base-200 flex items-start justify-between gap-4 sticky top-0 bg-base-100 z-10">
          <div className="space-y-1">
            <span className="badge badge-primary text-white text-2xs font-bold">
              Tuyển dụng trực tiếp
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-base-content tracking-tight">
              {job.title}
            </h3>
            <p className="text-xs text-base-content/60 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{company?.name}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Key Job Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Mức lương</span>
              <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">{job.salary}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Địa điểm</span>
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.location}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Hình thức</span>
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.type}</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50 border border-base-200/80">
              <span className="text-2xs text-base-content/50 uppercase font-semibold">Kinh nghiệm</span>
              <p className="text-xs sm:text-sm font-semibold text-base-content mt-0.5">{job.experience}</p>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-base-content/70 uppercase">Kỹ năng yêu cầu:</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-base-200 text-xs font-medium text-base-content/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Requirements preview */}
          <div className="space-y-2 text-xs sm:text-sm text-base-content/80">
            <h4 className="font-bold text-base-content uppercase text-xs tracking-wider">
              Mô tả công việc & Trách nhiệm
            </h4>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Tham gia phát triển các tính năng và module nghiệp vụ theo yêu cầu dự án.</li>
              <li>Phối hợp cùng Product Owner, Designer và QA để hoàn thiện sản phẩm đạt chuẩn chất lượng.</li>
              <li>Tối ưu hóa hiệu năng và tuân thủ các quy chuẩn bảo mật cao cấp.</li>
              <li>Nghiên cứu và ứng dụng các công nghệ mới vào quy trình phát triển.</li>
            </ul>
          </div>

          {/* Apply Form */}
          {!applied ? (
            <form onSubmit={handleSubmit} className="pt-4 border-t border-base-200 space-y-3.5">
              <h4 className="font-bold text-sm text-base-content flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Nộp hồ sơ ứng tuyển nhanh</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-base-content/70">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                  />
                </div>
                <div>
                  <label className="text-2xs font-semibold text-base-content/70">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-2xs font-semibold text-base-content/70">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="input input-bordered input-sm w-full rounded-lg text-xs mt-1 focus:input-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-base-content/70">Lời nhắn tới nhà tuyển dụng (tùy chọn)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Tóm tắt ngắn về kinh nghiệm hoặc lý do bạn phù hợp với vị trí này..."
                  className="textarea textarea-bordered textarea-sm w-full rounded-lg text-xs mt-1 focus:textarea-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost btn-sm text-xs font-semibold rounded-lg"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm px-6 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ ngay'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-success/10 border border-success/20 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
              <h4 className="font-bold text-base text-base-content">
                Đã gửi hồ sơ ứng tuyển thành công!
              </h4>
              <p className="text-xs text-base-content/70 max-w-sm mx-auto">
                Nhà tuyển dụng từ <span className="font-semibold text-primary">{company?.name}</span> sẽ xem xét hồ sơ và phản hồi qua email hoặc số điện thoại của bạn.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm px-5 text-white font-semibold rounded-lg mt-2 text-xs"
              >
                Hoàn tất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;

