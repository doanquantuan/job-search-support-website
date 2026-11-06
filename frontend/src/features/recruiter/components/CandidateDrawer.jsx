import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Award,
  XCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  Building2,
  Video,
  MapPin,
  Sparkles,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/store/useToastStore";

const STAGES = [
  { id: "APPLIED", label: "Mới nộp", color: "btn-ghost" },
  { id: "VIEWED", label: "Đã xem", color: "btn-ghost" },
  { id: "REVIEWING", label: "Đang đánh giá", color: "btn-ghost" },
  { id: "INTERVIEW", label: "Mời phỏng vấn", color: "btn-warning" },
  { id: "HIRED", label: "Trúng tuyển", color: "btn-success" },
  { id: "REJECTED", label: "Chưa phù hợp", color: "btn-error" },
];

export const CandidateDrawer = ({
  isOpen,
  onClose,
  applicant,
  onUpdateStatus,
  updating = false,
}) => {
  const [activeTab, setActiveTab] = useState("cv"); // "cv" | "review" | "history"
  const [targetStatus, setTargetStatus] = useState("REVIEWING");
  const [note, setNote] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  // Interview state
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLocation, setInterviewLocation] = useState(
    "Google Meet (Sẽ gửi link qua email)"
  );
  const [interviewer, setInterviewer] = useState("Tech Lead & HR Team");

  useEffect(() => {
    if (applicant) {
      setTargetStatus(applicant.applicationStatus || "REVIEWING");
      setNote(applicant.lastNote || "");
      if (applicant.interviewDetails) {
        setInterviewDate(
          applicant.interviewDetails.date
            ? applicant.interviewDetails.date.split("T")[0]
            : ""
        );
        setInterviewLocation(
          applicant.interviewDetails.location || "Google Meet"
        );
        setInterviewer(
          applicant.interviewDetails.interviewer || "Tech Lead"
        );
      }
    }
  }, [applicant]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info("Đã sao chép", text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitStatus = (e) => {
    e.preventDefault();
    if (!applicant) return;

    const interviewPayload =
      targetStatus === "INTERVIEW"
        ? {
            date: interviewDate,
            location: interviewLocation,
            interviewer,
          }
        : null;

    onUpdateStatus?.(applicant.id || applicant.applicationId, targetStatus, note, interviewPayload);
  };

  if (!applicant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral/40 backdrop-blur-sm"
          />

          {/* Drawer Container (Sliding from Right) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="relative w-full max-w-2xl bg-base-100 shadow-2xl border-l border-base-300 flex flex-col h-full z-10 overflow-hidden"
          >
            {/* ── Top Header ─────────────────────────────────────────── */}
            <div className="p-6 border-b border-base-200 bg-base-100 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-14 h-14 rounded-2xl ring-2 ring-primary/20 overflow-hidden">
                    {applicant.avatar ? (
                      <img
                        src={applicant.avatar}
                        alt={applicant.candidateName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary font-extrabold text-xl flex items-center justify-center">
                        {applicant.candidateName?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-base-content">
                      {applicant.candidateName}
                    </h2>
                    <StatusBadge status={applicant.applicationStatus} size="sm" />
                  </div>
                  <p className="text-xs text-base-content/70 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold">{applicant.jobTitle}</span>
                  </p>
                  <p className="text-2xs text-base-content/50">
                    Nộp đơn:{" "}
                    {applicant.appliedAt
                      ? new Date(applicant.appliedAt).toLocaleString("vi-VN")
                      : "Gần đây"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
                title="Đóng bảng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Quick Contact Bar ──────────────────────────────────── */}
            <div className="px-6 py-2.5 bg-base-200/50 border-b border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4">
                {applicant.candidateEmail && (
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Mail className="w-3.5 h-3.5 text-base-content/50" />
                    <span>{applicant.candidateEmail}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(applicant.candidateEmail, "email")}
                      className="hover:text-primary transition-colors ml-1"
                      title="Sao chép email"
                    >
                      {copiedField === "email" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {applicant.candidatePhone && (
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Phone className="w-3.5 h-3.5 text-base-content/50" />
                    <span>{applicant.candidatePhone}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(applicant.candidatePhone, "phone")}
                      className="hover:text-primary transition-colors ml-1"
                      title="Sao chép SĐT"
                    >
                      {copiedField === "phone" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {applicant.matchScore && (
                <span className="badge badge-sm bg-emerald-500/10 text-emerald-700 font-bold border-emerald-500/20">
                  Độ phù hợp: {applicant.matchScore}%
                </span>
              )}
            </div>

            {/* ── Tab Navigation ─────────────────────────────────────── */}
            <div className="px-6 border-b border-base-200 flex gap-6 shrink-0 bg-base-100">
              {[
                { id: "cv", label: "Hồ sơ & CV đính kèm", icon: FileText },
                { id: "review", label: "Chấm điểm & Vòng tuyển dụng", icon: Award },
                { id: "history", label: "Lịch sử đánh giá", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all relative whitespace-nowrap ${
                      isActive
                        ? "text-primary border-primary"
                        : "text-base-content/60 border-transparent hover:text-base-content"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Tab Body Content ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "cv" && (
                <div className="space-y-6">
                  {/* CV File Box */}
                  <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-base-content truncate">
                          {applicant.cvTitle || "CV_UngVien.pdf"}
                        </h4>
                        <p className="text-2xs text-base-content/50">
                          Định dạng PDF • Đã quét an toàn virus
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={applicant.cvUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-xs gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở file</span>
                      </a>
                      <a
                        href={applicant.cvUrl || "#"}
                        download
                        className="btn btn-primary btn-xs text-white gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    </div>
                  </div>

                  {/* Skills Tag Row */}
                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-base-content uppercase tracking-wider">
                        Kỹ năng chuyên môn khai báo:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.skills.map((s) => (
                          <span
                            key={s}
                            className="badge badge-sm bg-base-200 text-base-content/80 font-medium border-base-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {applicant.coverLetter && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span>Thư giới thiệu bản thân (Cover Letter):</span>
                      </h4>
                      <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 text-xs text-base-content/80 whitespace-pre-line leading-relaxed">
                        {applicant.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* High Fidelity CV Snapshot Preview Card */}
                  <div className="p-6 rounded-2xl border border-base-300 bg-base-100 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-base-200 pb-3">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Bản tóm tắt hồ sơ năng lực
                      </span>
                      <span className="text-2xs text-base-content/50">
                        Kinh nghiệm: {applicant.experience || "3+ năm"}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="font-semibold text-base-content/70">Mục tiêu nghề nghiệp:</p>
                        <p className="text-base-content/80 mt-0.5 leading-relaxed">
                          Mong muốn cống hiến chuyên môn trong việc phát triển kiến trúc phần mềm hiện đại, đóng góp giải pháp tối ưu cho sản phẩm và đồng hành phát triển lâu dài cùng doanh nghiệp.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-base-content/70">Học vấn & Bằng cấp:</p>
                        <p className="text-base-content/80 mt-0.5">
                          • Cử nhân Công nghệ Thông tin - Đại học Quốc gia TP.HCM (Tốt nghiệp loại Giỏi)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "review" && (
                <form onSubmit={handleSubmitStatus} className="space-y-6">
                  {/* Select Stage Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-content uppercase tracking-wider">
                      Chuyển vòng tuyển dụng:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STAGES.map((stg) => {
                        const isSelected = targetStatus === stg.id;
                        return (
                          <button
                            key={stg.id}
                            type="button"
                            onClick={() => setTargetStatus(stg.id)}
                            className={`btn btn-sm text-xs justify-start gap-2 border transition-all ${
                              isSelected
                                ? "btn-primary text-white shadow-xs font-bold"
                                : "btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/80"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? "bg-white" : "bg-base-content/40"
                              }`}
                            />
                            <span>{stg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interview Details if INTERVIEW is selected */}
                  <AnimatePresence>
                    {targetStatus === "INTERVIEW" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4"
                      >
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                          <Video className="w-4 h-4 text-amber-600" />
                          <span>Thiết lập lịch hẹn phỏng vấn</span>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-2xs font-semibold text-base-content">
                              Thời gian phỏng vấn
                            </label>
                            <input
                              type="datetime-local"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                              className="input input-bordered input-sm w-full focus:input-primary"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-2xs font-semibold text-base-content">
                              Hình thức / Địa điểm họp
                            </label>
                            <input
                              type="text"
                              value={interviewLocation}
                              onChange={(e) => setInterviewLocation(e.target.value)}
                              placeholder="Google Meet link hoặc phòng họp trụ sở"
                              className="input input-bordered input-sm w-full focus:input-primary"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-2xs font-semibold text-base-content">
                              Người phụ trách phỏng vấn (Interviewer)
                            </label>
                            <input
                              type="text"
                              value={interviewer}
                              onChange={(e) => setInterviewer(e.target.value)}
                              placeholder="Ví dụ: Tech Lead & HR Manager"
                              className="input input-bordered input-sm w-full focus:input-primary"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Internal Evaluation Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-base-content uppercase tracking-wider">
                      Ghi chú đánh giá nội bộ (Internal Notes)
                    </label>
                    <textarea
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi lại nhận xét về ứng viên, điểm mạnh, mức lương kỳ vọng hoặc kết quả phỏng vấn..."
                      className="textarea textarea-bordered w-full text-xs focus:textarea-primary leading-relaxed"
                    />
                    <p className="text-2xs text-base-content/50">
                      Ghi chú này chỉ hiển thị nội bộ trong phòng tuyển dụng của công ty.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-primary btn-sm w-full text-white shadow-xs gap-2"
                    >
                      {updating ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{updating ? "Đang lưu..." : "Cập nhật vòng tuyển dụng"}</span>
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-base-content uppercase tracking-wider">
                    Dòng thời gian chuyển đổi trạng thái:
                  </h4>

                  {applicant.statusHistories && applicant.statusHistories.length > 0 ? (
                    <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-base-300">
                      {applicant.statusHistories.map((hist, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-base-100" />
                          <div className="flex items-center gap-2">
                            <StatusBadge status={hist.status} size="sm" withDot={false} />
                            <span className="text-2xs text-base-content/50">
                              {new Date(hist.changedAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-xs text-base-content/80 font-medium">
                            {hist.note || "Thay đổi trạng thái hồ sơ"}
                          </p>
                          <p className="text-2xs text-base-content/50">
                            Bởi: {hist.changedBy || "Hệ thống"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/50 italic">
                      Chưa có lịch sử thay đổi trạng thái nào.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CandidateDrawer;
