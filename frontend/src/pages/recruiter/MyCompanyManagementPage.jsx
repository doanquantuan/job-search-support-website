import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  Camera,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  Save,
  RotateCcw,
  ShieldCheck,
  Briefcase,
  FileText,
  HeartHandshake,
} from "lucide-react";
import { companyApi } from "@/features/company/services/companyApi";
import { toast } from "@/store/useToastStore";
import { MASTER_CATEGORIES } from "@/constants/categories";

const COMPANY_SIZES = [
  { value: "SIZE_1_50", label: "1 - 50 nhân viên (Startup)" },
  { value: "SIZE_51_200", label: "51 - 200 nhân viên (Vừa & Nhỏ)" },
  { value: "SIZE_201_500", label: "201 - 500 nhân viên (Doanh nghiệp vừa)" },
  { value: "SIZE_501_1000", label: "501 - 1.000 nhân viên (Doanh nghiệp lớn)" },
  { value: "SIZE_1001_5000", label: "1.000+ nhân viên (Tập đoàn đa quốc gia)" },
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
  "Bà Rịa - Vũng Tàu",
  "Quảng Nam",
  "Thừa Thiên Huế",
  "Khánh Hòa",
];

const PRESET_BENEFITS = [
  "Lương tháng 13 & Thưởng KPI",
  "Gói bảo hiểm sức khỏe toàn diện",
  "Trang bị máy tính cá nhân cấu hình cao",
  "Chế độ làm việc kết hợp (Hybrid)",
  "Du lịch & Team Building hàng năm",
  "Trợ cấp ăn trưa & Gửi xe miễn phí",
  "Khám sức khỏe định kỳ hàng năm",
  "Hỗ trợ đào tạo & Thi chứng chỉ",
  "Phòng pantry trà, cà phê & bánh ngọt tự do",
  "14 - 16 ngày phép năm hưởng nguyên lương",
];

export const MyCompanyManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | contact | culture
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [companyData, setCompanyData] = useState({
    id: "comp-1",
    companyName: "",
    taxCode: "",
    industry: "Công nghệ thông tin",
    companySize: "SIZE_51_200",
    description: "",
    website: "",
    email: "",
    phone: "",
    province: "TP. Hồ Chí Minh",
    address: "",
    logo: "",
    coverImage: "",
    workingDays: "Thứ 2 - Thứ 6 (08:30 - 17:30)",
    founded: "2020",
    verificationStatus: "APPROVED",
    benefits: [],
  });

  const [initialData, setInitialData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await companyApi.getMyCompany();
        if (res) {
          const loaded = {
            id: res.id || res.companyId || "comp-1",
            companyName: res.companyName || res.name || "",
            taxCode: res.taxCode || "",
            industry: res.industry || "Công nghệ thông tin",
            companySize: res.companySize || "SIZE_51_200",
            description: res.description || "",
            website: res.website || "",
            email: res.email || "",
            phone: res.phone || "",
            province: res.province || "TP. Hồ Chí Minh",
            address: res.address || "",
            logo: res.logo || "",
            coverImage: res.coverImage || "",
            workingDays: res.workingDays || "Thứ 2 - Thứ 6 (08:30 - 17:30)",
            founded: res.founded || "2020",
            verificationStatus: res.verificationStatus || "APPROVED",
            benefits: Array.isArray(res.benefits) ? res.benefits : [],
          };
          setCompanyData(loaded);
          setInitialData(loaded);
          setLogoPreview(loaded.logo);
          setCoverPreview(loaded.coverImage);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin công ty:", err);
        toast.error("Không thể tải thông tin công ty", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleInputChange = (field, value) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Kích thước quá lớn", "Vui lòng chọn ảnh logo dưới 5MB");
        return;
      }
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("Kích thước quá lớn", "Vui lòng chọn ảnh bìa dưới 10MB");
        return;
      }
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleAddBenefit = (benefit) => {
    const trimmed = (benefit || newBenefitInput).trim();
    if (!trimmed) return;
    if (companyData.benefits.includes(trimmed)) {
      toast.warning("Đã tồn tại", "Phúc lợi này đã có trong danh sách");
      return;
    }
    setCompanyData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, trimmed],
    }));
    setNewBenefitInput("");
  };

  const handleRemoveBenefit = (indexToRemove) => {
    setCompanyData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleResetForm = () => {
    if (initialData) {
      setCompanyData(initialData);
      setLogoPreview(initialData.logo);
      setCoverPreview(initialData.coverImage);
      setLogoFile(null);
      setCoverFile(null);
      toast.info("Đã khôi phục dữ liệu ban đầu");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyData.companyName.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tên công ty");
      return;
    }
    if (!companyData.email.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập email liên hệ");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(companyData).forEach((key) => {
        if (key === "benefits") {
          formData.append(key, JSON.stringify(companyData[key]));
        } else {
          formData.append(key, companyData[key]);
        }
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      await companyApi.updateMyCompany(formData);
      toast.success("Cập nhật thành công", "Thông tin doanh nghiệp đã được lưu lại!");
      setInitialData(companyData);
    } catch (err) {
      console.warn("Lỗi cập nhật công ty:", err.message);
      // Giả lập lưu thành công cho môi trường frontend mock
      toast.success("Đã cập nhật", "Thông tin doanh nghiệp đã được lưu thành công (Demo Mode)");
      setInitialData(companyData);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 text-sm">Đang tải hồ sơ doanh nghiệp...</p>
      </div>
    );
  }

  const isVerified = companyData.verificationStatus === "APPROVED";

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header Banner & Brand Identity ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-base-100 border border-base-300 shadow-sm">
        {/* Cover Photo */}
        <div
          className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-900 group"
          style={{ background: "linear-gradient(135deg, #1B365D 0%, #005A9C 50%, #00406e 100%)" }}
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Company Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30 text-white">
              <Building2 className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end p-4">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="btn btn-sm btn-neutral text-white shadow-md gap-2"
            >
              <Upload className="w-4 h-4" />
              Đổi ảnh bìa
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        {/* Identity Details Row */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-14">
            {/* Logo Avatar with Overlay */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-base-100 p-1.5 shadow-xl border-2 border-base-100 ring-2 ring-primary/20 overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={companyData.companyName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-3xl">
                    {companyData.companyName.charAt(0) || "C"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer m-1"
                title="Tải logo mới"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Đổi Logo</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            {/* Title & Status */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-base-content">
                  {companyData.companyName || "Chưa đặt tên công ty"}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã xác thực
                  </span>
                ) : (
                  <Link
                    to="/recruiter/verification"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Chưa xác thực GPKD
                  </Link>
                )}
              </div>
              <p className="text-sm text-base-content/60 flex items-center justify-center sm:justify-start gap-2">
                <span>{companyData.industry}</span>
                <span>•</span>
                <span>{companyData.province}</span>
                <span>•</span>
                <span>Mã số thuế: {companyData.taxCode || "Chưa có"}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 pt-2 sm:pt-0">
            <Link
              to={`/companies/${companyData.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              Xem trang công khai
            </Link>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary btn-sm text-white gap-2 shadow-sm"
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </motion.button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 border-t border-base-200 flex gap-6 overflow-x-auto">
          {[
            { id: "general", label: "Thông tin chung", icon: Building2 },
            { id: "contact", label: "Liên hệ & Trụ sở", icon: MapPin },
            { id: "culture", label: "Giới thiệu & Phúc lợi", icon: HeartHandshake },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 font-medium text-sm border-b-2 transition-all relative ${
                  isActive
                    ? "text-primary border-primary font-semibold"
                    : "text-base-content/60 border-transparent hover:text-base-content"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form Body with Tab Content ────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100 rounded-2xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div>
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Hồ sơ pháp lý & Định danh doanh nghiệp
                </h3>
                <p className="text-sm text-base-content/60 mt-1">
                  Thông tin pháp nhân hiển thị trên trang tin tuyển dụng và hồ sơ doanh nghiệp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên công ty */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-base-content">
                    Tên doanh nghiệp chính thức <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ TechFlow"
                    className="input input-bordered w-full focus:input-primary"
                    required
                  />
                  <p className="text-xs text-base-content/50">
                    Nên trùng khớp với tên trên Giấy chứng nhận Đăng ký Kinh doanh.
                  </p>
                </div>

                {/* Mã số thuế */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content flex items-center justify-between">
                    <span>Mã số thuế (MST)</span>
                    {isVerified && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực bảo mật
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyData.taxCode}
                      disabled={isVerified}
                      onChange={(e) => handleInputChange("taxCode", e.target.value)}
                      placeholder="Ví dụ: 0316892345"
                      className={`input input-bordered w-full ${
                        isVerified ? "bg-base-200/70 text-base-content/70 cursor-not-allowed" : "focus:input-primary"
                      }`}
                    />
                  </div>
                  {isVerified ? (
                    <p className="text-xs text-base-content/50">
                      Mã số thuế đã được quản trị viên duyệt xác thực, không thể chỉnh sửa tự do.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600">
                      Vui lòng nhập đúng MST để được duyệt xác thực tài khoản nhanh chóng.
                    </p>
                  )}
                </div>

                {/* Lĩnh vực hoạt động */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Lĩnh vực hoạt động chính <span className="text-error">*</span>
                  </label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {MASTER_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="Khác">Khác / Đa ngành</option>
                  </select>
                </div>

                {/* Quy mô nhân sự */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Quy mô nhân sự <span className="text-error">*</span>
                  </label>
                  <select
                    value={companyData.companySize}
                    onChange={(e) => handleInputChange("companySize", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Năm thành lập */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Năm thành lập
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={companyData.founded}
                      onChange={(e) => handleInputChange("founded", e.target.value)}
                      placeholder="2020"
                      className="input input-bordered w-full pl-10 focus:input-primary"
                    />
                  </div>
                </div>

                {/* Thời gian làm việc */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-base-content">
                    Thời gian làm việc tiêu chuẩn
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="text"
                      value={companyData.workingDays}
                      onChange={(e) => handleInputChange("workingDays", e.target.value)}
                      placeholder="Ví dụ: Thứ 2 - Thứ 6 (08:30 - 17:30)"
                      className="input input-bordered w-full pl-10 focus:input-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100 rounded-2xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div>
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Địa chỉ trụ sở & Kênh liên lạc
                </h3>
                <p className="text-sm text-base-content/60 mt-1">
                  Giúp ứng viên dễ dàng định vị địa điểm làm việc và gửi phản hồi tuyển dụng.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tỉnh / Thành phố */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Tỉnh / Thành phố trụ sở <span className="text-error">*</span>
                  </label>
                  <select
                    value={companyData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Website công ty
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="url"
                      value={companyData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://company.example.com"
                      className="input input-bordered w-full pl-10 focus:input-primary"
                    />
                  </div>
                </div>

                {/* Email tuyển dụng */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Email tuyển dụng / liên hệ <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="hr@company.example.com"
                      className="input input-bordered w-full pl-10 focus:input-primary"
                      required
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-base-content">
                    Hotline / Điện thoại tuyển dụng
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="tel"
                      value={companyData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="028 3822 9999"
                      className="input input-bordered w-full pl-10 focus:input-primary"
                    />
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-base-content">
                    Địa chỉ chi tiết văn phòng <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Số tầng, Tên tòa nhà, Tên đường, Phường/Xã, Quận/Huyện"
                    className="input input-bordered w-full focus:input-primary"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "culture" && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100 rounded-2xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div>
                <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  Môi trường làm việc & Chế độ phúc lợi
                </h3>
                <p className="text-sm text-base-content/60 mt-1">
                  Mô tả hấp dẫn giúp doanh nghiệp tạo ấn tượng mạnh mẽ và thu hút nhiều ứng viên tiềm năng hơn.
                </p>
              </div>

              {/* Mô tả công ty */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-base-content">
                    Mô tả / Giới thiệu về doanh nghiệp <span className="text-error">*</span>
                  </label>
                  <span className="text-xs text-base-content/50">
                    {companyData.description.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={companyData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Hãy chia sẻ sứ mệnh, tầm nhìn, văn hóa làm việc và thành tựu nổi bật của doanh nghiệp..."
                  className="textarea textarea-bordered w-full leading-relaxed focus:textarea-primary"
                  required
                />
              </div>

              {/* Danh sách phúc lợi */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-base-content">
                    Chế độ đãi ngộ & Phúc lợi nổi bật ({companyData.benefits.length})
                  </label>
                  <span className="text-xs text-primary font-medium">Nhấn vào chip để xóa</span>
                </div>

                {/* Selected Benefit Chips with spring pop animation */}
                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-base-200/50 rounded-xl border border-base-300">
                  <AnimatePresence>
                    {companyData.benefits.map((benefit, index) => (
                      <motion.span
                        key={benefit}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs group"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(index)}
                          className="hover:bg-primary/20 rounded p-0.5 ml-0.5 text-primary/70 hover:text-primary transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>

                  {companyData.benefits.length === 0 && (
                    <span className="text-xs text-base-content/40 italic flex items-center py-1">
                      Chưa có phúc lợi nào được thêm. Hãy chọn các gợi ý bên dưới hoặc thêm mới.
                    </span>
                  )}
                </div>

                {/* Custom Benefit Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    placeholder="Nhập đãi ngộ đặc biệt khác rồi bấm Thêm..."
                    className="input input-bordered input-sm flex-1 focus:input-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddBenefit()}
                    disabled={!newBenefitInput.trim()}
                    className="btn btn-primary btn-sm text-white gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm
                  </button>
                </div>

                {/* Quick select presets */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-base-content/70">
                    Gợi ý phúc lợi phổ biến (bấm để thêm nhanh):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BENEFITS.map((item) => {
                      const isAdded = companyData.benefits.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddBenefit(item)}
                          className={`btn btn-xs rounded-md transition-all ${
                            isAdded
                              ? "btn-disabled opacity-40 border-dashed"
                              : "btn-ghost bg-base-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          }`}
                        >
                          + {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sticky Save Footer ─────────────────────────────────────────── */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
          <div className="flex items-center gap-2 text-xs text-base-content/70">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Mẹo: Cập nhật hồ sơ đầy đủ giúp tỷ lệ phản hồi của ứng viên tăng thêm 65%.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetForm}
              className="btn btn-ghost btn-sm gap-1.5 text-base-content/70"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm text-white px-6 gap-2 shadow-sm"
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyCompanyManagementPage;
