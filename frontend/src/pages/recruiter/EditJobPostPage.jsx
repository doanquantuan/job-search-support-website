import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Eye,
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
  "PostgreSQL",
  "Docker",
  "Figma",
  "AWS",
];

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
            jobLevel: job.jobLevel || "MIDDLE",
            workMode: job.workMode || job.workplaceType || "HYBRID",
            employmentType: job.employmentType || "FULL_TIME",
            salaryType: job.salaryType || (job.salary?.includes("–") ? "RANGE" : "NEGOTIABLE"),
            salaryMin: job.salaryMin || 15000000,
            salaryMax: job.salaryMax || 25000000,
            province: job.province || "TP. Hồ Chí Minh",
            address: job.address || "",
            quantity: job.quantity || 1,
            deadline: job.deadline ? job.deadline.split("T")[0] : "",
            experience: job.experience || "1 - 3 năm",
            skills: Array.isArray(job.skills) ? job.skills : ["React"],
            description: job.description || "",
            requirements: Array.isArray(job.requirements) && job.requirements.length > 0
              ? job.requirements
              : ["Có ít nhất 2 năm kinh nghiệm chuyên môn."],
            benefits: Array.isArray(job.benefits) && job.benefits.length > 0
              ? job.benefits
              : ["Lương thưởng cạnh tranh, xét tăng lương định kỳ."],
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
      toast.error("Thiếu thông tin", "Vui lòng nhập tiêu đề vị trí.");
      return;
    }

    setSaving(true);
    try {
      await updateJobPost(jobId, formData);
      navigate("/recruiter/jobs");
    } catch {
      // error handled
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
              Cập nhật mô tả, mức lương hoặc chính sách tuyển dụng cho mã tin #{jobId}.
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

      {/* ── Form Body ───────────────────────────────────────────────────────── */}
      <div className="bg-base-100 p-6 sm:p-8 rounded-2xl border border-base-300 shadow-2xs space-y-6">
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

          {/* Hình thức */}
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
              Loại hợp đồng
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

          {/* Mức lương Min-Max */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Lương tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              step="1000000"
              value={formData.salaryMin}
              onChange={(e) => handleChange("salaryMin", e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">
              Lương tối đa (VNĐ)
            </label>
            <input
              type="number"
              step="1000000"
              value={formData.salaryMax}
              onChange={(e) => handleChange("salaryMax", e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>

          {/* Tỉnh / TP & Địa chỉ */}
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
              Địa chỉ làm việc cụ thể
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>
        </div>

        {/* TagInput Kỹ năng */}
        <div className="pt-2">
          <TagInput
            label="Kỹ năng chuyên môn yêu cầu"
            tags={formData.skills}
            onChange={(newSkills) => handleChange("skills", newSkills)}
            suggestions={POPULAR_SKILLS}
          />
        </div>

        {/* Mô tả chi tiết */}
        <div className="space-y-1.5 pt-2">
          <label className="text-sm font-semibold text-base-content">
            Mô tả chi tiết công việc (Job Description)
          </label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="textarea textarea-bordered w-full focus:textarea-primary leading-relaxed"
          />
        </div>

        {/* Yêu cầu ứng viên */}
        <div className="space-y-2 pt-2">
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

        {/* Quyền lợi */}
        <div className="space-y-2 pt-2">
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

        {/* Trạng thái tin */}
        <div className="space-y-1.5 pt-2 max-w-xs">
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
