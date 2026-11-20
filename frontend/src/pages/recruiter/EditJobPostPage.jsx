import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  GraduationCap,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";
import { jobApi } from "@/features/job/services/jobApi";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { MASTER_CATEGORIES } from "@/constants/categories";
import { TagInput } from "@/components/common/TagInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/store/useToastStore";

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

const EDUCATION_LEVELS = [
  { value: "NO_REQUIREMENT", label: "Không yêu cầu bằng cấp" },
  { value: "HIGH_SCHOOL", label: "Tốt nghiệp THPT / Trung cấp" },
  { value: "COLLEGE", label: "Cao đẳng" },
  { value: "UNIVERSITY", label: "Đại học / Cử nhân" },
  { value: "POSTGRADUATE", label: "Sau đại học (Thạc sĩ / Tiến sĩ)" },
];

const EXPERIENCE_OPTIONS = [
  "Không yêu cầu",
  "Dưới 1 năm",
  "1 - 3 năm",
  "3 - 5 năm",
  "Trên 5 năm",
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
  "Docker",
  "Figma",
  "AWS",
  "Tiếng Anh giao tiếp",
];

// Helper format ngày sang YYYY-MM-DD cho input type="date"
const parseDateToInputFormat = (dateVal) => {
  if (!dateVal) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (_e) {}
  return "";
};

// Helper tách chuỗi nhiều dòng từ DB thành mảng cho danh sách dòng
const parseMultilineToList = (val, fallback = []) => {
  if (Array.isArray(val) && val.length > 0) return val;
  if (typeof val === "string" && val.trim().length > 0) {
    const lines = val
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length > 0) return lines;
  }
  return fallback;
};

export const EditJobPostPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { updateJobPost } = useRecruiterJobStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const job = await jobApi.getJobById(jobId);
        if (job) {
          setFormData({
            title: job.title || "",
            industry: job.industry || "Công nghệ thông tin",
            jobLevel:
              job.rawJobLevel ||
              (JOB_LEVELS.some((l) => l.value === job.jobLevel)
                ? job.jobLevel
                : "MIDDLE"),
            workMode:
              job.rawWorkMode ||
              (WORK_MODES.some((m) => m.value === job.workMode)
                ? job.workMode
                : "HYBRID"),
            employmentType:
              job.rawEmploymentType ||
              (EMPLOYMENT_TYPES.some((e) => e.value === job.employmentType)
                ? job.employmentType
                : "FULL_TIME"),
            educationLevel:
              job.rawEducationLevel ||
              (EDUCATION_LEVELS.some((el) => el.value === job.educationLevel)
                ? job.educationLevel
                : "NO_REQUIREMENT"),
            workingHours: job.workingHours || "Thứ 2 - Thứ 6 (08:30 - 17:30)",
            quantity: job.vacancies || job.quantity || 1,
            salaryType:
              job.salaryType === "NEGOTIABLE" ? "NEGOTIABLE" : "RANGE",
            salaryMin: job.salaryMin ? Number(job.salaryMin) : 15000000,
            salaryMax: job.salaryMax ? Number(job.salaryMax) : 25000000,
            province: job.province || "TP. Hồ Chí Minh",
            address: job.address || "",
            deadline: parseDateToInputFormat(job.rawDeadline || job.deadline),
            experience: job.experience || "1 - 3 năm",
            skills:
              Array.isArray(job.skills) && job.skills.length > 0
                ? job.skills
                : ["React"],
            description: job.description || "",
            requirements: parseMultilineToList(job.requirements, [
              "Có ít nhất 2 năm kinh nghiệm chuyên môn.",
            ]),
            benefits: parseMultilineToList(job.benefits, [
              "Lương thưởng cạnh tranh, xét tăng lương định kỳ.",
            ]),
            status: job.status || "PUBLISHED",
          });
        } else {
          toast.error("Không tìm thấy tin", "Tin tuyển dụng không tồn tại hoặc đã bị xóa.");
          navigate("/recruiter/jobs");
        }
      } catch (err) {
        toast.error("Lỗi tải tin tuyển dụng", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleUpdateItem = (field, index, value) => {
    setFormData((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const handleRemoveItem = (field, index) => {
    setFormData((prev) => {
      const list = [...(prev[field] || [])];
      list.splice(index, 1);
      return { ...prev, [field]: list };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tiêu đề vị trí tuyển dụng.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        vacancies: Number(formData.quantity) || 1,
      };
      await updateJobPost(jobId, payload);
      navigate("/recruiter/jobs");
    } catch {
      // error handled in store
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-xs text-base-content/60">Đang tải thông tin tin tuyển dụng...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-300 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/jobs"
            className="btn btn-ghost btn-sm btn-circle text-base-content/70"
            title="Quay lại danh sách tin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-base-content">
                Chỉnh Sửa Tin Tuyển Dụng
              </h1>
              <StatusBadge status={formData.status} size="sm" />
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Cập nhật mô tả, mức lương, điều kiện tuyển dụng đầy đủ cho mã tin #{jobId}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm text-white px-5 gap-2 shadow-xs"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {/* ── PHẦN 1: Vị trí & Phân loại tuyển dụng ──────────────────────────── */}
      <div className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6">
        <div className="border-b border-base-200 pb-3 flex items-center gap-2 text-base font-bold text-base-content">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>1. Thông tin vị trí & Cấp bậc tuyển dụng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tiêu đề */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-base-content">
              Tiêu đề vị trí tuyển dụng <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ví dụ: Senior React Developer / Kế toán trưởng"
              className="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          {/* Ngành nghề */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Nhóm ngành nghề
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className="select select-bordered w-full focus:select-primary"
            >
              {MASTER_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Cấp bậc */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Cấp bậc chuyên môn
            </label>
            <select
              value={formData.jobLevel}
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
              Hình thức làm việc
            </label>
            <select
              value={formData.workMode}
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

          {/* Hợp đồng */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Loại hợp đồng lao động
            </label>
            <select
              value={formData.employmentType}
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

          {/* Trình độ học vấn */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Yêu cầu trình độ học vấn
            </label>
            <select
              value={formData.educationLevel}
              onChange={(e) => handleChange("educationLevel", e.target.value)}
              className="select select-bordered w-full focus:select-primary"
            >
              {EDUCATION_LEVELS.map((el) => (
                <option key={el.value} value={el.value}>
                  {el.label}
                </option>
              ))}
            </select>
          </div>

          {/* Yêu cầu kinh nghiệm */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Yêu cầu số năm kinh nghiệm
            </label>
            <select
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              className="select select-bordered w-full focus:select-primary"
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Số lượng cần tuyển */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Số lượng cần tuyển (người)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>

          {/* Thời gian làm việc */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Thời gian làm việc
            </label>
            <input
              type="text"
              value={formData.workingHours}
              onChange={(e) => handleChange("workingHours", e.target.value)}
              placeholder="Thứ 2 - Thứ 6 (08:30 - 17:30)"
              className="input input-bordered w-full focus:input-primary"
            />
          </div>
        </div>
      </div>

      {/* ── PHẦN 2: Mức đãi ngộ & Địa điểm làm việc ────────────────────────── */}
      <div className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6">
        <div className="border-b border-base-200 pb-3 flex items-center gap-2 text-base font-bold text-base-content">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>2. Mức đãi ngộ & Địa điểm làm việc</span>
        </div>

        {/* Lựa chọn loại mức lương */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-base-content">
            Chế độ lương
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => handleChange("salaryType", "RANGE")}
              className={`p-3 rounded-xl border text-center transition-all ${
                formData.salaryType === "RANGE"
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
                formData.salaryType === "NEGOTIABLE"
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
          {formData.salaryType === "RANGE" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 p-4 rounded-xl border border-base-300"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-base-content">
                  Mức lương tối thiểu (VNĐ / tháng)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={formData.salaryMin}
                  onChange={(e) => handleChange("salaryMin", e.target.value)}
                  placeholder="15000000"
                  className="input input-bordered w-full focus:input-primary"
                />
                <p className="text-2xs text-base-content/50">
                  = {Number(formData.salaryMin || 0) / 1000000} triệu VNĐ
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-base-content">
                  Mức lương tối đa (VNĐ / tháng)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={formData.salaryMax}
                  onChange={(e) => handleChange("salaryMax", e.target.value)}
                  placeholder="25000000"
                  className="input input-bordered w-full focus:input-primary"
                />
                <p className="text-2xs text-base-content/50">
                  = {Number(formData.salaryMax || 0) / 1000000} triệu VNĐ
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Địa điểm làm việc & Hạn chót */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Tỉnh / Thành phố
            </label>
            <select
              value={formData.province}
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Hạn chót nhận hồ sơ
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-base-content">
              Địa chỉ làm việc chi tiết
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Số tòa nhà, Tên đường, Phường/Xã, Quận/Huyện"
              className="input input-bordered w-full focus:input-primary"
            />
          </div>
        </div>
      </div>

      {/* ── PHẦN 3: Yêu cầu chuyên môn & Quyền lợi ────────────────────────── */}
      <div className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6">
        <div className="border-b border-base-200 pb-3 flex items-center gap-2 text-base font-bold text-base-content">
          <FileText className="w-5 h-5 text-primary" />
          <span>3. Yêu cầu chuyên môn & Quyền lợi ứng viên</span>
        </div>

        {/* TagInput Kỹ năng */}
        <div className="space-y-1.5">
          <TagInput
            label="Kỹ năng chuyên môn yêu cầu *"
            tags={formData.skills}
            onChange={(newSkills) => handleChange("skills", newSkills)}
            suggestions={POPULAR_SKILLS}
            placeholder="Gõ kỹ năng (ví dụ: ReactJS) rồi nhấn Enter..."
            helperText="Ứng viên tìm kiếm công việc theo các từ khóa kỹ năng này."
          />
        </div>

        {/* Mô tả chi tiết */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-base-content">
            Mô tả chi tiết công việc (Job Description)
          </label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="textarea textarea-bordered w-full focus:textarea-primary leading-relaxed"
            placeholder="Mô tả các nhiệm vụ và trách nhiệm chính của vị trí..."
          />
        </div>

        {/* Yêu cầu ứng viên */}
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
              Thêm dòng
            </button>
          </div>

          <div className="space-y-2">
            {formData.requirements?.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleUpdateItem("requirements", idx, e.target.value)}
                  className="input input-bordered input-sm flex-1 focus:input-primary"
                  placeholder="Ví dụ: Có ít nhất 2 năm kinh nghiệm làm việc thực tế"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("requirements", idx)}
                  className="btn btn-ghost btn-sm btn-square text-error"
                  title="Xóa dòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quyền lợi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-base-content">
              Quyền lợi được hưởng (Benefits)
            </label>
            <button
              type="button"
              onClick={() => handleAddItem("benefits")}
              className="btn btn-ghost btn-xs text-primary gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm dòng
            </button>
          </div>

          <div className="space-y-2">
            {formData.benefits?.map((ben, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ben}
                  onChange={(e) => handleUpdateItem("benefits", idx, e.target.value)}
                  className="input input-bordered input-sm flex-1 focus:input-primary"
                  placeholder="Ví dụ: Thưởng tháng 13 và review lương định kỳ hàng năm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("benefits", idx)}
                  className="btn btn-ghost btn-sm btn-square text-error"
                  title="Xóa dòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trạng thái tin */}
        <div className="space-y-1.5 max-w-xs pt-2">
          <label className="text-sm font-semibold text-base-content">
            Trạng thái tin tuyển dụng
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="select select-bordered w-full focus:select-primary"
          >
            <option value="PUBLISHED">Công khai (PUBLISHED)</option>
            <option value="DRAFT">Bản nháp (DRAFT)</option>
            <option value="CLOSED">Đã đóng nhận đơn (CLOSED)</option>
          </select>
        </div>
      </div>

      {/* ── Sticky Save Footer ──────────────────────────────────────────────── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-20">
        <Link to="/recruiter/jobs" className="btn btn-ghost btn-sm">
          Hủy bỏ
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-sm text-white px-6 gap-2 shadow-xs"
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
        </button>
      </div>
    </form>
  );
};

export default EditJobPostPage;
