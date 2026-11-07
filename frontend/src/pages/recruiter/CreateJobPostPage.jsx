import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { companyApi } from "@/features/company/services/companyApi";
import { MASTER_CATEGORIES } from "@/constants/categories";
import { TagInput } from "@/components/common/TagInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/store/useToastStore";

const WIZARD_STEPS = [
  { id: 1, title: "Vị trí & Cấp bậc", desc: "Thông tin chức danh và phân loại" },
  { id: 2, title: "Lương & Địa điểm", desc: "Mức thu nhập và nơi làm việc" },
  { id: 3, title: "Yêu cầu & Quyền lợi", desc: "Kỹ năng, mô tả và chế độ đãi ngộ" },
  { id: 4, title: "Xem trước & Đăng tin", desc: "Kiểm tra và hoàn tất đăng tuyển" },
];

const JOB_LEVELS = [
  { value: "INTERN", label: "Thực tập sinh (Intern)" },
  { value: "FRESHER", label: "Fresher / Mới tốt nghiệp" },
  { value: "JUNIOR", label: "Nhân viên (Junior - 1 đến 2 năm)" },
  { value: "MIDDLE", label: "Chuyên viên (Middle - 2 đến 4 năm)" },
  { value: "SENIOR", label: "Chuyên viên cấp cao (Senior - 4+ năm)" },
  { value: "LEAD", label: "Trưởng nhóm (Team Lead / Tech Lead)" },
  { value: "MANAGER", label: "Quản lý / Giám đốc bộ phận (Manager)" },
];

const WORK_MODES = [
  { value: "HYBRID", label: "Làm việc kết hợp (Hybrid)" },
  { value: "ONSITE", label: "Tại văn phòng (On-site)" },
  { value: "REMOTE", label: "Từ xa hoàn toàn (100% Remote)" },
];

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Toàn thời gian (Full-time)" },
  { value: "PART_TIME", label: "Bán thời gian (Part-time)" },
  { value: "CONTRACT", label: "Hợp đồng dự án (Contract)" },
  { value: "INTERNSHIP", label: "Thực tập có trợ cấp" },
];

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
  "Cần Thơ",
  "Hải Phòng",
  "Bắc Ninh",
  "Toàn quốc",
];

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "TailwindCSS",
  "SQL",
  "PostgreSQL",
  "Figma",
  "Git",
  "Docker",
  "Tiếng Anh giao tiếp",
  "Kỹ năng đàm phán",
  "Quản lý dự án",
];

export const CreateJobPostPage = () => {
  const navigate = useNavigate();
  const { jobFormDraft, setJobFormDraft, createJobPost, saving } =
    useRecruiterJobStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    companyApi
      .getMyCompany()
      .then((c) => {
        setCompanyInfo(c);
        if (c?.address && !jobFormDraft.address) {
          setJobFormDraft({ address: c.address, province: c.province });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setJobFormDraft({ [field]: value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (currentStep === 1) {
      if (!jobFormDraft.title?.trim()) {
        errors.title = "Vui lòng nhập tiêu đề vị trí tuyển dụng";
      }
    } else if (currentStep === 2) {
      if (jobFormDraft.salaryType === "RANGE") {
        if (!jobFormDraft.salaryMin || Number(jobFormDraft.salaryMin) <= 0) {
          errors.salaryMin = "Vui lòng nhập mức lương tối thiểu";
        }
        if (
          jobFormDraft.salaryMax &&
          Number(jobFormDraft.salaryMax) < Number(jobFormDraft.salaryMin)
        ) {
          errors.salaryMax = "Mức lương tối đa phải lớn hơn mức lương tối thiểu";
        }
      }
      if (!jobFormDraft.address?.trim()) {
        errors.address = "Vui lòng nhập địa chỉ làm việc";
      }
    } else if (currentStep === 3) {
      if (!jobFormDraft.description?.trim()) {
        errors.description = "Vui lòng nhập mô tả công việc";
      }
      if (!jobFormDraft.skills || jobFormDraft.skills.length === 0) {
        errors.skills = "Vui lòng thêm ít nhất 1 kỹ năng yêu cầu";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Dynamic Array Handlers for Requirements & Benefits
  const handleAddItem = (field) => {
    const currentList = jobFormDraft[field] || [];
    setJobFormDraft({ [field]: [...currentList, ""] });
  };

  const handleUpdateItem = (field, index, value) => {
    const currentList = [...(jobFormDraft[field] || [])];
    currentList[index] = value;
    setJobFormDraft({ [field]: currentList });
  };

  const handleRemoveItem = (field, index) => {
    const currentList = [...(jobFormDraft[field] || [])];
    currentList.splice(index, 1);
    setJobFormDraft({ [field]: currentList });
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateCurrentStep()) return;

    try {
      await createJobPost(jobFormDraft, isDraft);
      navigate("/recruiter/jobs");
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-300 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Đăng tin tuyển dụng mới
          </div>
          <h1 className="text-2xl font-bold text-base-content">
            Tạo Tin Tuyển Dụng Mới
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
            Đăng tải vị trí tuyển dụng để tiếp cận hàng nghìn ứng viên chất lượng cao.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving || !jobFormDraft.title.trim()}
            className="btn btn-outline btn-sm gap-1.5"
            title="Lưu lại dạng bản nháp để hoàn thiện sau"
          >
            <Save className="w-4 h-4" />
            <span>Lưu bản nháp</span>
          </button>
        </div>
      </div>

      {/* ── Wizard Step Navigation Bar ───────────────────────────────────────── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep || validateCurrentStep()) {
                    setDirection(step.id > currentStep ? 1 : -1);
                    setCurrentStep(step.id);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isCurrent
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : isCompleted
                    ? "bg-base-200/50 border-base-300 text-base-content"
                    : "bg-base-100 border-base-200 text-base-content/50 hover:bg-base-200/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-primary text-white"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-base-300 text-base-content/60"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{step.title}</p>
                    <p className="text-2xs opacity-70 truncate hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step Form Content with Slide Animations ─────────────────────────── */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6"
            >
              <div className="border-b border-base-200 pb-4">
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Bước 1: Vị trí & Định danh công việc
                </h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Xác định chức danh, nhóm ngành nghề và cấp bậc để tiếp cận đúng ứng viên mục tiêu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tiêu đề công việc */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-base-content">
                    Tiêu đề công việc <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormDraft.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ví dụ: Senior Frontend Engineer (React / TypeScript)"
                    className={`input input-bordered w-full focus:input-primary ${
                      validationErrors.title ? "input-error" : ""
                    }`}
                  />
                  {validationErrors.title ? (
                    <p className="text-xs text-error">{validationErrors.title}</p>
                  ) : (
                    <p className="text-xs text-base-content/50">
                      Tiêu đề rõ ràng, chứa từ khóa chuyên môn giúp tăng 40% lượt ứng tuyển.
                    </p>
                  )}
                </div>

                {/* Ngành nghề hoạt động */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Nhóm ngành nghề <span className="text-error">*</span>
                  </label>
                  <select
                    value={jobFormDraft.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {MASTER_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="Khác">Ngành nghề khác</option>
                  </select>
                </div>

                {/* Cấp bậc công việc */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Cấp bậc chuyên môn <span className="text-error">*</span>
                  </label>
                  <select
                    value={jobFormDraft.jobLevel}
                    onChange={(e) => handleChange("jobLevel", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {JOB_LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hình thức làm việc */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Hình thức làm việc <span className="text-error">*</span>
                  </label>
                  <select
                    value={jobFormDraft.workMode}
                    onChange={(e) => handleChange("workMode", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {WORK_MODES.map((wm) => (
                      <option key={wm.value} value={wm.value}>
                        {wm.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loại hợp đồng */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Loại hợp đồng lao động <span className="text-error">*</span>
                  </label>
                  <select
                    value={jobFormDraft.employmentType}
                    onChange={(e) => handleChange("employmentType", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {EMPLOYMENT_TYPES.map((et) => (
                      <option key={et.value} value={et.value}>
                        {et.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6"
            >
              <div className="border-b border-base-200 pb-4">
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Bước 2: Mức đãi ngộ & Địa điểm làm việc
                </h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Mức thu nhập minh bạch là yếu tố quan trọng hàng đầu để thu hút ứng viên tài năng.
                </p>
              </div>

              <div className="space-y-6">
                {/* Lựa chọn loại mức lương */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-base-content">
                    Chế độ lương <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => handleChange("salaryType", "RANGE")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        jobFormDraft.salaryType === "RANGE"
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-base-100 border-base-300 text-base-content/70 hover:bg-base-200/50"
                      }`}
                    >
                      Khoảng lương cụ thể (VNĐ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("salaryType", "NEGOTIABLE")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        jobFormDraft.salaryType === "NEGOTIABLE"
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-base-100 border-base-300 text-base-content/70 hover:bg-base-200/50"
                      }`}
                    >
                      Thỏa thuận theo năng lực
                    </button>
                  </div>
                </div>

                {/* Input khoảng lương */}
                <AnimatePresence>
                  {jobFormDraft.salaryType === "RANGE" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 p-4 rounded-xl border border-base-300"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-base-content">
                          Mức lương tối thiểu (VNĐ / tháng) <span className="text-error">*</span>
                        </label>
                        <input
                          type="number"
                          step="1000000"
                          value={jobFormDraft.salaryMin}
                          onChange={(e) => handleChange("salaryMin", e.target.value)}
                          placeholder="15000000"
                          className="input input-bordered w-full focus:input-primary"
                        />
                        <p className="text-2xs text-base-content/50">
                          = {Number(jobFormDraft.salaryMin || 0) / 1000000} triệu VNĐ
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-base-content">
                          Mức lương tối đa (VNĐ / tháng)
                        </label>
                        <input
                          type="number"
                          step="1000000"
                          value={jobFormDraft.salaryMax}
                          onChange={(e) => handleChange("salaryMax", e.target.value)}
                          placeholder="25000000"
                          className="input input-bordered w-full focus:input-primary"
                        />
                        <p className="text-2xs text-base-content/50">
                          = {Number(jobFormDraft.salaryMax || 0) / 1000000} triệu VNĐ
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Địa điểm làm việc */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-base-content">
                      Tỉnh / Thành phố <span className="text-error">*</span>
                    </label>
                    <select
                      value={jobFormDraft.province}
                      onChange={(e) => handleChange("province", e.target.value)}
                      className="select select-bordered w-full focus:select-primary"
                    >
                      {PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-base-content">
                      Địa chỉ làm việc chi tiết <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobFormDraft.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Số tòa nhà, Tên đường, Phường/Xã, Quận/Huyện"
                      className={`input input-bordered w-full focus:input-primary ${
                        validationErrors.address ? "input-error" : ""
                      }`}
                    />
                    {validationErrors.address && (
                      <p className="text-xs text-error">{validationErrors.address}</p>
                    )}
                  </div>
                </div>

                {/* Số lượng & Hạn chót */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-base-content">
                      Số lượng cần tuyển
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={jobFormDraft.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      className="input input-bordered w-full focus:input-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-base-content">
                      Hạn chót nhận hồ sơ
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={jobFormDraft.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="input input-bordered w-full focus:input-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6"
            >
              <div className="border-b border-base-200 pb-4">
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Bước 3: Yêu cầu chuyên môn & Quyền lợi
                </h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Mô tả chi tiết công việc, các kỹ năng bắt buộc và chính sách đãi ngộ dành cho nhân sự.
                </p>
              </div>

              {/* TagInput Reusable Component */}
              <div className="space-y-1.5">
                <TagInput
                  label="Kỹ năng chuyên môn yêu cầu *"
                  tags={jobFormDraft.skills}
                  onChange={(newSkills) => handleChange("skills", newSkills)}
                  suggestions={POPULAR_SKILLS}
                  placeholder="Gõ kỹ năng (ví dụ: ReactJS) rồi nhấn Enter..."
                  error={validationErrors.skills}
                  helperText="Ứng viên tìm kiếm công việc theo các từ khóa kỹ năng này."
                />
              </div>

              {/* Kinh nghiệm */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-base-content">
                  Yêu cầu số năm kinh nghiệm
                </label>
                <select
                  value={jobFormDraft.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className="select select-bordered w-full focus:select-primary"
                >
                  <option value="Không yêu cầu">Không yêu cầu kinh nghiệm</option>
                  <option value="Dưới 1 năm">Dưới 1 năm</option>
                  <option value="1 - 3 năm">1 – 3 năm kinh nghiệm</option>
                  <option value="3 - 5 năm">3 – 5 năm kinh nghiệm</option>
                  <option value="Trên 5 năm">Trên 5 năm kinh nghiệm</option>
                </select>
              </div>

              {/* Mô tả công việc */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-base-content">
                    Mô tả công việc (Job Description) <span className="text-error">*</span>
                  </label>
                  <span className="text-2xs text-base-content/50">
                    {jobFormDraft.description.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={jobFormDraft.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mô tả các trách nhiệm hàng ngày, quy trình làm việc và mục tiêu của vị trí..."
                  className={`textarea textarea-bordered w-full focus:textarea-primary leading-relaxed ${
                    validationErrors.description ? "textarea-error" : ""
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-xs text-error">{validationErrors.description}</p>
                )}
              </div>

              {/* Yêu cầu ứng viên (Dynamic List) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-base-content">
                    Yêu cầu ứng viên (Requirements)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddItem("requirements")}
                    className="btn btn-ghost btn-xs text-primary gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm yêu cầu
                  </button>
                </div>

                <div className="space-y-2">
                  {jobFormDraft.requirements?.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs text-base-content/40 font-bold">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleUpdateItem("requirements", idx, e.target.value)}
                        placeholder={`Yêu cầu số ${idx + 1}...`}
                        className="input input-bordered input-sm flex-1 focus:input-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("requirements", idx)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quyền lợi ứng viên (Dynamic List) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-base-content">
                    Quyền lợi & Đãi ngộ (Benefits)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddItem("benefits")}
                    className="btn btn-ghost btn-xs text-primary gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm đãi ngộ
                  </button>
                </div>

                <div className="space-y-2">
                  {jobFormDraft.benefits?.map((ben, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs text-base-content/40 font-bold">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={ben}
                        onChange={(e) => handleUpdateItem("benefits", idx, e.target.value)}
                        placeholder={`Quyền lợi số ${idx + 1}...`}
                        className="input input-bordered input-sm flex-1 focus:input-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("benefits", idx)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Preview Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      Tin tuyển dụng đã sẵn sàng đăng tải
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                      Vui lòng xem lại bản tóm tắt bên dưới trước khi bấm xuất bản chính thức.
                    </p>
                  </div>
                </div>
                <StatusBadge status="PUBLISHED" size="md" />
              </div>

              {/* Full Job Preview Card */}
              <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-base-200">
                  <div className="space-y-1">
                    <span className="badge badge-primary text-white text-xs font-semibold">
                      {jobFormDraft.industry}
                    </span>
                    <h2 className="text-2xl font-bold text-base-content">
                      {jobFormDraft.title}
                    </h2>
                    <p className="text-sm text-base-content/70 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{companyInfo?.companyName || "TechFlow Corporation"}</span>
                      <span>•</span>
                      <MapPin className="w-4 h-4 text-base-content/50" />
                      <span>{jobFormDraft.province}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-xs text-base-content/60 font-medium">Mức thu nhập</p>
                    <p className="text-xl font-extrabold text-primary">
                      {jobFormDraft.salaryType === "RANGE"
                        ? `${Number(jobFormDraft.salaryMin || 0) / 1000000} – ${
                            Number(jobFormDraft.salaryMax || 0) / 1000000
                          } triệu VNĐ`
                        : "Thỏa thuận theo năng lực"}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Pill Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-base-200/50 rounded-xl">
                  <div>
                    <p className="text-2xs text-base-content/50">Cấp bậc</p>
                    <p className="text-xs font-bold text-base-content mt-0.5">
                      {JOB_LEVELS.find((l) => l.value === jobFormDraft.jobLevel)?.label ||
                        jobFormDraft.jobLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-base-content/50">Hình thức</p>
                    <p className="text-xs font-bold text-base-content mt-0.5">
                      {WORK_MODES.find((w) => w.value === jobFormDraft.workMode)?.label ||
                        jobFormDraft.workMode}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-base-content/50">Kinh nghiệm</p>
                    <p className="text-xs font-bold text-base-content mt-0.5">
                      {jobFormDraft.experience}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-base-content/50">Hạn nộp hồ sơ</p>
                    <p className="text-xs font-bold text-base-content mt-0.5">
                      {jobFormDraft.deadline || "Không giới hạn"}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-base-content">Kỹ năng chuyên môn:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jobFormDraft.skills.map((s) => (
                      <span
                        key={s}
                        className="badge badge-sm bg-primary/10 text-primary border-primary/20 font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-base-content">Mô tả công việc:</h4>
                  <p className="text-sm text-base-content/80 whitespace-pre-line leading-relaxed">
                    {jobFormDraft.description}
                  </p>
                </div>

                {/* Requirements */}
                {jobFormDraft.requirements?.filter(Boolean).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-base-content">Yêu cầu ứng viên:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-base-content/80">
                      {jobFormDraft.requirements.filter(Boolean).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {jobFormDraft.benefits?.filter(Boolean).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-base-content">Quyền lợi được hưởng:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-base-content/80">
                      {jobFormDraft.benefits.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky Action Footer ────────────────────────────────────────────── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm flex items-center justify-between sticky bottom-4 z-20">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn btn-ghost btn-sm gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary btn-sm text-white px-5 gap-1.5 shadow-sm"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="btn btn-ghost btn-sm gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu nháp</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="btn btn-primary btn-sm text-white px-6 gap-1.5 shadow-sm"
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{saving ? "Đang xuất bản..." : "Đăng tin ngay"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobPostPage;
