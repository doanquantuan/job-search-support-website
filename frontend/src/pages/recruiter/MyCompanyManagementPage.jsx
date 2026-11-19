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
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { companyApi } from "@/features/company/services/companyApi";
import { ImageLightboxModal } from "@/features/company/components/ImageLightboxModal";
import { toast } from "@/store/useToastStore";
import { MASTER_CATEGORIES } from "@/constants/categories";

const MAX_ENV_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const envInputRef = useRef(null);

  const [companyData, setCompanyData] = useState({
    id: "",
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
    environmentImages: [],
    workingDays: "Thứ 2 - Thứ 6 (08:30 - 17:30)",
    founded: "2020",
    verificationStatus: "NOT_REGISTERED",
    benefits: [],
  });

  const [initialData, setInitialData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [retainedEnvironments, setRetainedEnvironments] = useState([]);
  const [newEnvItems, setNewEnvItems] = useState([]); // [{ id, file, previewUrl }]
  const [isDraggingEnv, setIsDraggingEnv] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const [res, verificationRes] = await Promise.all([
          companyApi.getMyCompany(),
          companyApi.getVerificationStatus().catch(() => null),
        ]);

        const verificationStatus =
          res?.verificationStatus ||
          verificationRes?.verificationStatus ||
          "NOT_REGISTERED";

        if (res) {
          const loaded = {
            id: res.id || res.companyId || "",
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
            environmentImages: Array.isArray(res.environmentImages) ? res.environmentImages : [],
            workingDays: res.workingDays || "Thứ 2 - Thứ 6 (08:30 - 17:30)",
            founded: res.founded || "2020",
            verificationStatus,
            benefits: Array.isArray(res.benefits) ? res.benefits : [],
          };
          setCompanyData(loaded);
          setInitialData(loaded);
          setLogoPreview(loaded.logo);
          setRetainedEnvironments(loaded.environmentImages);
        } else {
          // Khi recruiter chưa có công ty
          const emptyState = {
            id: verificationRes?.companyId || "",
            companyName: verificationRes?.companyName || "",
            taxCode: verificationRes?.taxCode || "",
            industry: verificationRes?.industry || "Công nghệ thông tin",
            companySize: verificationRes?.companySize || "SIZE_51_200",
            description: "",
            website: "",
            email: "",
            phone: "",
            province: verificationRes?.province || "TP. Hồ Chí Minh",
            address: verificationRes?.address || "",
            logo: "",
            environmentImages: [],
            workingDays: "Thứ 2 - Thứ 6 (08:30 - 17:30)",
            founded: "2020",
            verificationStatus,
            benefits: [],
          };
          setCompanyData(emptyState);
          setInitialData(emptyState);
          setRetainedEnvironments([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin công ty:", err);
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
    if (!file) return;
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast.warning("Định dạng không hợp lệ", "Logo chỉ hỗ trợ định dạng JPG, PNG hoặc WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.warning("Kích thước quá lớn", "Vui lòng chọn ảnh logo dưới 5MB.");
      e.target.value = "";
      return;
    }
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    e.target.value = "";
  };

  // Thêm nhiều ảnh môi trường vào danh sách xem trước (chỉ lưu khi bấm "Lưu thay đổi")
  const addEnvironmentFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const currentTotal = retainedEnvironments.length + newEnvItems.length;
    const remainingSlots = MAX_ENV_IMAGES - currentTotal;

    if (remainingSlots <= 0) {
      toast.warning(
        "Đã đạt giới hạn ảnh",
        `Mỗi công ty chỉ được lưu tối đa ${MAX_ENV_IMAGES} ảnh môi trường làm việc.`
      );
      return;
    }

    const validItems = [];
    let skippedType = 0;
    let skippedSize = 0;

    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
        skippedType++;
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        skippedSize++;
        continue;
      }
      if (validItems.length >= remainingSlots) {
        break;
      }
      validItems.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (skippedType > 0) {
      toast.warning(
        "Định dạng không hỗ trợ",
        `Đã bỏ qua ${skippedType} tệp không phải JPG, PNG hoặc WEBP.`
      );
    }
    if (skippedSize > 0) {
      toast.warning(
        "Ảnh vượt quá 5MB",
        `Đã bỏ qua ${skippedSize} ảnh có dung lượng lớn hơn 5MB.`
      );
    }
    if (files.length - skippedType - skippedSize > remainingSlots) {
      toast.info(
        "Chỉ thêm tối đa số ảnh còn trống",
        `Hệ thống chỉ nhận thêm ${remainingSlots} ảnh để không vượt quá ${MAX_ENV_IMAGES} ảnh.`
      );
    }

    if (validItems.length > 0) {
      setNewEnvItems((prev) => [...prev, ...validItems]);
      toast.info(
        `Đã thêm ${validItems.length} ảnh môi trường`,
        "Nhấn 'Lưu thay đổi' để tải lên hệ thống."
      );
    }
  };

  const handleGoToEnvironmentsSection = () => {
    setActiveTab("culture");
    setTimeout(() => {
      const el = document.getElementById("company-environments-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  };

  const handleEnvFileChange = (e) => {
    addEnvironmentFiles(e.target.files);
    e.target.value = "";
  };

  const handleEnvDrop = (e) => {
    e.preventDefault();
    setIsDraggingEnv(false);
    addEnvironmentFiles(e.dataTransfer?.files);
  };

  // Gỡ ảnh đã lưu khỏi preview (chỉ xóa thật trên R2 & DB khi bấm "Lưu thay đổi")
  const handleRemoveRetainedEnv = (urlToRemove) => {
    setRetainedEnvironments((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // Gỡ ảnh mới chưa lưu khỏi hàng chờ
  const handleRemoveNewEnv = (idToRemove) => {
    setNewEnvItems((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
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
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      newEnvItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setCompanyData(initialData);
      setLogoPreview(initialData.logo);
      setLogoFile(null);
      setRetainedEnvironments(initialData.environmentImages || []);
      setNewEnvItems([]);
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

    if (isNotRegistered) {
      toast.warning(
        "Cần xác thực tài khoản",
        "Doanh nghiệp chưa hoàn tất khởi tạo pháp lý. Vui lòng chuyển sang trang 'Xác thực công ty' để tải lên Giấy phép kinh doanh (GPKD)."
      );
      return;
    }

    if (retainedEnvironments.length + newEnvItems.length > MAX_ENV_IMAGES) {
      toast.error(
        "Vượt quá giới hạn ảnh",
        `Mỗi công ty chỉ được lưu tối đa ${MAX_ENV_IMAGES} ảnh môi trường làm việc.`
      );
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      const profileFields = [
        "companyName",
        "companySize",
        "industry",
        "description",
        "website",
        "email",
        "phone",
        "province",
        "address",
      ];
      profileFields.forEach((key) => {
        if (companyData[key] !== undefined && companyData[key] !== null) {
          formData.append(key, companyData[key]);
        }
      });

      // Luôn gửi danh sách ảnh môi trường cũ được giữ lại để đồng bộ với server
      formData.append("retainedEnvironments", JSON.stringify(retainedEnvironments));

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      newEnvItems.forEach((item) => {
        formData.append("environments", item.file);
      });

      const updated = await companyApi.updateMyCompany(formData);

      // Giải phóng các blob URL tạm
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      newEnvItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });

      const syncedEnvs = Array.isArray(updated?.environmentImages)
        ? updated.environmentImages
        : retainedEnvironments;
      const syncedLogo = updated?.logo ?? companyData.logo;

      const syncedData = {
        ...companyData,
        companyName: updated?.companyName ?? companyData.companyName,
        companySize: updated?.companySize ?? companyData.companySize,
        industry: updated?.industry ?? companyData.industry,
        description: updated?.description ?? companyData.description,
        website: updated?.website ?? companyData.website,
        email: updated?.email ?? companyData.email,
        phone: updated?.phone ?? companyData.phone,
        province: updated?.province ?? companyData.province,
        address: updated?.address ?? companyData.address,
        logo: syncedLogo,
        environmentImages: syncedEnvs,
      };

      setCompanyData(syncedData);
      setInitialData(syncedData);
      setLogoPreview(syncedLogo);
      setLogoFile(null);
      setRetainedEnvironments(syncedEnvs);
      setNewEnvItems([]);

      toast.success(
        "Cập nhật thành công",
        "Thông tin công ty, logo và ảnh môi trường đã được lưu lên hệ thống!"
      );
    } catch (err) {
      console.warn("Lỗi cập nhật công ty:", err.message);
      if (err.response?.status === 404) {
        toast.warning(
          "Chưa đăng ký doanh nghiệp",
          "Vui lòng thực hiện Xác thực công ty (tải lên GPKD) để khởi tạo hồ sơ doanh nghiệp."
        );
      } else {
        toast.error("Lỗi cập nhật", err.response?.data?.message || err.message);
      }
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

  const isVerified = Boolean(
    companyData.verificationStatus === "APPROVED" &&
    companyData.companyName &&
    companyData.taxCode
  );
  const isPending = companyData.verificationStatus === "PENDING";
  const isRejected = companyData.verificationStatus === "REJECTED";
  const isNotRegistered = !companyData.verificationStatus || companyData.verificationStatus === "NOT_REGISTERED";

  const combinedEnvPreviews = [
    ...retainedEnvironments.map((url) => ({ type: "saved", id: url, url })),
    ...newEnvItems.map((item) => ({ type: "new", id: item.id, url: item.previewUrl })),
  ];
  const allEnvUrlsForLightbox = combinedEnvPreviews.map((item) => item.url);
  const totalEnvCount = combinedEnvPreviews.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Lightbox xem ảnh môi trường phóng to */}
      <ImageLightboxModal
        images={allEnvUrlsForLightbox}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        altPrefix={`Ảnh môi trường ${companyData.companyName || "công ty"}`}
      />
      {/* Hidden Multi-file Input cho ảnh môi trường (dùng chung cho cả Banner & Tab Văn hóa) */}
      <input
        ref={envInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleEnvFileChange}
      />

      {/* ── Top Header Banner & Brand Identity ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-base-100 border border-base-300 shadow-sm">
        {/* Banner Ảnh Môi trường công ty (Environments) */}
        <div
          className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-900 group"
          style={{ background: "linear-gradient(135deg, #1B365D 0%, #005A9C 50%, #00406e 100%)" }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingEnv(true);
          }}
          onDragLeave={() => setIsDraggingEnv(false)}
          onDrop={handleEnvDrop}
        >
          {combinedEnvPreviews.length > 0 ? (
            <img
              src={combinedEnvPreviews[0].url}
              alt="Ảnh môi trường công ty"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-40 text-white gap-1.5">
              <ImageIcon className="w-14 h-14" />
              <span className="text-xs font-medium">Chưa có ảnh môi trường làm việc</span>
            </div>
          )}

          {/* Overlay tối nhẹ giúp nút và badge luôn rõ nét */}
          <div
            className={`absolute inset-0 transition-colors duration-200 ${
              isDraggingEnv
                ? "bg-primary/40 border-2 border-dashed border-white"
                : "bg-gradient-to-t from-black/50 via-black/15 to-black/25"
            }`}
          />

          {/* Top-left badge số lượng ảnh môi trường */}
          <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-xs font-semibold border border-white/15">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ảnh môi trường ({totalEnvCount}/{MAX_ENV_IMAGES})</span>
            </span>
            {newEnvItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold shadow">
                +{newEnvItems.length} chờ lưu
              </span>
            )}
          </div>

          {/* Top-right action buttons: Upload ảnh môi trường + Quản lý thư viện */}
          <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
            {totalEnvCount > 0 && (
              <button
                type="button"
                onClick={handleGoToEnvironmentsSection}
                className="btn btn-sm bg-black/55 hover:bg-black/75 text-white border border-white/20 backdrop-blur-sm shadow-md gap-1.5"
                title="Xem và quản lý toàn bộ ảnh môi trường"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Quản lý ảnh</span>
              </button>
            )}
            <button
              type="button"
              disabled={totalEnvCount >= MAX_ENV_IMAGES}
              onClick={() => envInputRef.current?.click()}
              className="btn btn-sm btn-neutral text-white shadow-md gap-2 border border-white/15 disabled:opacity-60"
              title={
                totalEnvCount >= MAX_ENV_IMAGES
                  ? `Đã đạt tối đa ${MAX_ENV_IMAGES} ảnh môi trường`
                  : "Chọn nhiều ảnh môi trường làm việc"
              }
            >
              <Upload className="w-4 h-4" />
              <span>Tải ảnh môi trường</span>
            </button>
          </div>

          {/* Bottom-right mini thumbnails preview khi có nhiều ảnh */}
          {combinedEnvPreviews.length > 0 && (
            <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-1.5 z-10">
              {combinedEnvPreviews.slice(0, 4).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="w-12 h-9 rounded-lg overflow-hidden border-2 border-white/80 shadow-md hover:scale-105 transition-transform relative cursor-pointer"
                  title="Nhấn để phóng to"
                >
                  <img
                    src={item.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {combinedEnvPreviews.length > 4 && (
                <button
                  type="button"
                  onClick={handleGoToEnvironmentsSection}
                  className="w-12 h-9 rounded-lg bg-black/65 hover:bg-black/80 text-white text-xs font-bold border-2 border-white/80 shadow-md flex items-center justify-center cursor-pointer"
                  title="Xem tất cả ảnh môi trường"
                >
                  +{combinedEnvPreviews.length - 4}
                </button>
              )}
            </div>
          )}
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
                accept="image/jpeg,image/png,image/webp"
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
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Đang chờ duyệt GPKD
                  </span>
                ) : isRejected ? (
                  <Link
                    to="/recruiter/verification"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    GPKD bị từ chối (Gửi lại)
                  </Link>
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
            {companyData.id && isVerified ? (
              <Link
                to={`/companies/${companyData.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Xem trang công khai
              </Link>
            ) : null}
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

      {/* ── Banner thông báo trạng thái xác thực pháp lý ─────────────────── */}
      {!isVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-amber-900 text-sm sm:text-base">
                {isPending
                  ? "Hồ sơ pháp lý doanh nghiệp đang chờ duyệt xác thực"
                  : isRejected
                  ? "Hồ sơ xác thực GPKD chưa được phê duyệt"
                  : "Doanh nghiệp chưa hoàn tất xác thực giấy phép kinh doanh"}
              </p>
              <p className="text-amber-700/90 mt-1 leading-relaxed">
                {isPending
                  ? "Hồ sơ Giấy phép Đăng ký Kinh doanh (GPKD) đã được gửi và đang chờ ban quản trị kiểm duyệt (thường từ 15 phút - 2 giờ làm việc)."
                  : isRejected
                  ? "Hồ sơ xác thực GPKD bị từ chối hoặc cần bổ sung thông tin. Vui lòng kiểm tra lại để gửi lại hồ sơ."
                  : "Để được cấp huy hiệu Doanh nghiệp Đã xác minh, bảo vệ mã số thuế và đăng tin tuyển dụng không giới hạn, vui lòng gửi hồ sơ xác thực GPKD."}
              </p>
            </div>
          </div>
          <Link
            to="/recruiter/verification"
            className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0 font-medium px-4 shadow-xs"
          >
            {isPending ? "Xem tiến độ duyệt" : "Xác thực tài khoản ngay"}
          </Link>
        </div>
      )}

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

              {/* ── Hình ảnh môi trường làm việc (Environments — nhiều ảnh) ── */}
              <div id="company-environments-section" className="space-y-3 pt-5 border-t border-base-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold text-base-content flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>Hình ảnh môi trường làm việc ({totalEnvCount}/{MAX_ENV_IMAGES})</span>
                    </label>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      Tải lên ảnh văn phòng, không gian làm việc, hoạt động team building để thu hút ứng viên (JPG, PNG, WEBP — tối đa 5MB/ảnh).
                    </p>
                  </div>
                  {totalEnvCount < MAX_ENV_IMAGES && (
                    <button
                      type="button"
                      onClick={() => envInputRef.current?.click()}
                      className="btn btn-outline btn-primary btn-xs sm:btn-sm gap-1.5 rounded-xl font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Thêm ảnh ({MAX_ENV_IMAGES - totalEnvCount} còn trống)</span>
                    </button>
                  )}
                </div>

                {/* Drag & Drop Zone */}
                {totalEnvCount < MAX_ENV_IMAGES && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingEnv(true);
                    }}
                    onDragLeave={() => setIsDraggingEnv(false)}
                    onDrop={handleEnvDrop}
                    onClick={() => envInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        envInputRef.current?.click();
                      }
                    }}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                      isDraggingEnv
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-base-300 bg-base-200/35 hover:border-primary/60 hover:bg-primary/[0.03]"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-base-content">
                      Kéo thả nhiều ảnh vào đây hoặc nhấn để chọn tệp
                    </p>
                    <p className="text-xs text-base-content/55 mt-1">
                      Hỗ trợ chọn cùng lúc nhiều ảnh JPG, PNG, WEBP • Tối đa 5MB/ảnh • Tối đa {MAX_ENV_IMAGES} ảnh
                    </p>
                  </div>
                )}

                {/* Gallery Preview Grid */}
                {combinedEnvPreviews.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      <AnimatePresence>
                        {combinedEnvPreviews.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.88 }}
                            transition={{ duration: 0.2 }}
                            className="relative aspect-4/3 rounded-xl overflow-hidden bg-base-200 border border-base-300 group shadow-2xs"
                          >
                            <img
                              src={item.url}
                              alt={`Ảnh môi trường ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Nhãn ảnh mới chờ lưu */}
                            {item.type === "new" && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white shadow-sm">
                                Chờ lưu
                              </span>
                            )}

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setLightboxIndex(idx)}
                                className="btn btn-circle btn-xs sm:btn-sm bg-white/90 hover:bg-white text-slate-800 border-none shadow"
                                title="Xem phóng to"
                                aria-label="Xem phóng to"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  item.type === "saved"
                                    ? handleRemoveRetainedEnv(item.url)
                                    : handleRemoveNewEnv(item.id)
                                }
                                className="btn btn-circle btn-xs sm:btn-sm bg-error hover:bg-error/90 text-white border-none shadow"
                                title="Gỡ ảnh (sẽ áp dụng khi bấm Lưu thay đổi)"
                                aria-label="Gỡ ảnh"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <p className="text-[11px] text-base-content/55 italic">
                      Lưu ý: Mọi thay đổi thêm/gỡ ảnh môi trường và logo sẽ được áp dụng khi bạn nhấn nút <strong>Lưu thay đổi</strong> bên dưới.
                    </p>
                  </div>
                )}
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
