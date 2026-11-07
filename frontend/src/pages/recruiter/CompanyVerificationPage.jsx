import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Check,
  RefreshCw,
  Info,
} from "lucide-react";
import { companyApi } from "@/features/company/services/companyApi";
import { useToastStore } from "@/store/useToastStore";

export const CompanyVerificationPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [licenseUrl, setLicenseUrl] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    companyName: "",
    taxCode: "",
    industry: "",
    companySize: "SIZE_51_200",
    province: "TP. Hồ Chí Minh",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const showToast = useToastStore((state) => state.showToast);

  const loadData = async () => {
    setLoading(true);
    try {
      const statusRes = await companyApi.getVerificationStatus();
      setVerification(statusRes);

      if (statusRes) {
        setFormData((prev) => ({
          ...prev,
          companyName: statusRes.companyName || prev.companyName,
          taxCode: statusRes.taxCode || prev.taxCode,
          industry: statusRes.industry || prev.industry || "Công nghệ thông tin & Phần mềm",
          companySize: statusRes.companySize || prev.companySize,
          province: statusRes.province || prev.province,
          address: statusRes.address || prev.address,
          phone: statusRes.phone || prev.phone,
          email: statusRes.email || prev.email,
        }));
      }

      // Lấy presigned link file giấy phép
      companyApi.getLicenseUrl().then((res) => {
        if (res?.url) setLicenseUrl(res.url);
      }).catch(() => {});
    } catch (err) {
      console.warn("Không thể tải trạng thái xác thực:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast?.({
        type: "error",
        message: "Chỉ chấp nhận tệp định dạng PDF, JPG, PNG hoặc WEBP.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast?.({
        type: "error",
        message: "Dung lượng tệp giấy phép kinh doanh không được vượt quá 10MB.",
      });
      return;
    }
    setSelectedFile(file);
    setFormErrors((prev) => ({ ...prev, file: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName?.trim()) errors.companyName = "Tên công ty là bắt buộc.";
    if (!formData.taxCode?.trim()) {
      errors.taxCode = "Mã số thuế là bắt buộc.";
    } else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(formData.taxCode.trim())) {
      errors.taxCode = "Mã số thuế gồm 10 số (hoặc 10 số kèm 3 số chi nhánh, vd: 0101234567).";
    }
    if (!formData.address?.trim()) errors.address = "Địa chỉ trụ sở là bắt buộc.";
    if (!formData.phone?.trim()) errors.phone = "Số điện thoại liên hệ là bắt buộc.";
    if (!formData.email?.trim()) errors.email = "Email doanh nghiệp là bắt buộc.";
    if (!selectedFile && !verification?.businessLicenseUrl && verification?.verificationStatus !== "APPROVED") {
      errors.file = "Vui lòng đính kèm tệp Giấy phép kinh doanh.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const body = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) body.append(key, formData[key]);
    });
    if (selectedFile) {
      body.append("businessLicense", selectedFile);
    }

    try {
      if (verification?.verificationStatus === "REJECTED" || isResubmitting) {
        await companyApi.updateVerification(body);
      } else {
        await companyApi.registerVerification(body);
      }

      showToast?.({
        type: "success",
        message: "Đã nộp hồ sơ xác thực doanh nghiệp thành công. Quản trị viên sẽ xét duyệt trong 24-48 giờ làm việc.",
      });

      setIsResubmitting(false);
      setVerification((prev) => ({
        ...prev,
        ...formData,
        verificationStatus: "PENDING",
        submittedAt: new Date().toISOString(),
        rejectReason: null,
      }));
    } catch (err) {
      showToast?.({
        type: "error",
        message: err.response?.data?.message || err.message || "Gửi hồ sơ thất bại. Vui lòng kiểm tra lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const status = verification?.verificationStatus || "NOT_SUBMITTED";
  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  // Xác định bước của Stepper
  const getActiveStep = () => {
    if (isApproved) return 3;
    if (isPending) return 2;
    if (isRejected) return 1;
    return 1;
  };

  const activeStep = getActiveStep();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>Xác thực Doanh nghiệp</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Xác minh tư cách pháp nhân để đăng tin không giới hạn và gia tăng độ tin cậy với ứng viên
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn btn-outline btn-sm gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ── Stepper Timeline Animation ────────────────────────────────────────── */}
      <div className="card bg-base-100 border border-base-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1 */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                activeStep >= 1
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200 text-base-content/50"
              }`}
            >
              {activeStep > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "1"}
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-base-content">Nộp hồ sơ pháp lý</p>
              <p className="text-[11px] text-base-content/60">Điền MST & Giấy phép KD</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors relative ${
                activeStep >= 2
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200 text-base-content/50"
              }`}
            >
              {isPending ? (
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-primary/40 -z-10"
                />
              ) : null}
              {activeStep > 2 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "2"}
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-base-content">Admin thẩm định</p>
              <p className="text-[11px] text-base-content/60">Xử lý trong 24-48 giờ</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                isApproved
                  ? "bg-success text-white shadow-xs"
                  : "bg-base-200 text-base-content/50"
              }`}
            >
              {isApproved ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
              ) : (
                "3"
              )}
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-base-content">Hoàn tất xác thực</p>
              <p className="text-[11px] text-base-content/60">Cấp tích xanh doanh nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Banner Messages ────────────────────────────────────────────── */}
      {isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-success bg-success/15 border-success/30 text-success-content rounded-box shadow-xs flex items-start gap-3.5"
        >
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold text-success mb-0.5">Doanh nghiệp đã được xác thực chính thức!</h4>
            <p className="opacity-90 leading-relaxed">
              Hồ sơ pháp lý của bạn đã được kiểm duyệt bởi Quản trị viên. Tất cả tin tuyển dụng của công ty sẽ được hiển thị tích xanh và ưu tiên phân phối đến ứng viên.
            </p>
          </div>
        </motion.div>
      )}

      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning bg-warning/15 border-warning/30 text-warning-content rounded-box shadow-xs flex items-start gap-3.5"
        >
          <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold mb-0.5">Hồ sơ xác thực đang trong hàng đợi phê duyệt</h4>
            <p className="opacity-90 leading-relaxed">
              Bạn đã nộp hồ sơ vào lúc <strong>{new Date(verification?.submittedAt || Date.now()).toLocaleDateString("vi-VN")}</strong>. Đội ngũ kiểm duyệt của hệ thống đang đối chiếu mã số thuế và giấy phép kinh doanh.
            </p>
          </div>
        </motion.div>
      )}

      {isRejected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error bg-error/15 border-error/30 text-error-content rounded-box shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h4 className="font-bold text-error mb-0.5">Hồ sơ xác thực bị từ chối</h4>
              <p className="opacity-90 leading-relaxed">
                <strong>Lý do từ chối:</strong> {verification?.rejectReason || "Ảnh chụp giấy phép kinh doanh bị mờ hoặc mã số thuế chưa trùng khớp."}
              </p>
            </div>
          </div>
          {!isResubmitting && (
            <button
              type="button"
              onClick={() => setIsResubmitting(true)}
              className="btn btn-error btn-sm text-white shrink-0 font-semibold"
            >
              Nộp bổ sung hồ sơ
            </button>
          )}
        </motion.div>
      )}

      {/* ── Main Form (Disabled if Approved, or editable if Rejected/Not Submitted) ──── */}
      {(!isApproved || isResubmitting) && (
        <div className="card bg-base-100 border border-base-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-base-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary" />
              <span>Thông tin pháp lý doanh nghiệp</span>
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Vui lòng cung cấp chính xác các thông tin trùng khớp với Giấy chứng nhận đăng ký kinh doanh
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên công ty */}
              <div className="form-control sm:col-span-2 space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">
                    Tên doanh nghiệp chính thức <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ví dụ: CÔNG TY TNHH CÔNG NGHỆ TECHFLOW"
                  className={`input input-bordered input-sm sm:input-md w-full ${formErrors.companyName ? "input-error" : ""}`}
                />
                {formErrors.companyName && <span className="text-error text-2xs">{formErrors.companyName}</span>}
              </div>

              {/* Mã số thuế */}
              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">
                    Mã số thuế (Tax Code) <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  placeholder="Ví dụ: 0316892345"
                  className={`input input-bordered input-sm sm:input-md w-full font-mono ${formErrors.taxCode ? "input-error" : ""}`}
                />
                {formErrors.taxCode && <span className="text-error text-2xs">{formErrors.taxCode}</span>}
              </div>

              {/* Lĩnh vực hoạt động */}
              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">
                    Lĩnh vực kinh doanh <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Ví dụ: Công nghệ thông tin & Phần mềm"
                  className="input input-bordered input-sm sm:input-md w-full"
                />
              </div>

              {/* Quy mô công ty */}
              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">Quy mô nhân sự</span>
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="select select-bordered select-sm sm:select-md w-full text-xs sm:text-sm"
                >
                  <option value="SIZE_1_50">1 - 50 nhân viên</option>
                  <option value="SIZE_51_200">51 - 200 nhân viên</option>
                  <option value="SIZE_201_500">201 - 500 nhân viên</option>
                  <option value="SIZE_501_1000">501 - 1.000 nhân viên</option>
                  <option value="SIZE_1001_5000">1.000+ nhân viên</option>
                </select>
              </div>

              {/* Tỉnh thành */}
              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">Tỉnh/Thành phố</span>
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="TP. Hồ Chí Minh"
                  className="input input-bordered input-sm sm:input-md w-full"
                />
              </div>

              {/* Địa chỉ trụ sở */}
              <div className="form-control sm:col-span-2 space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">
                    Địa chỉ trụ sở chính <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Tòa nhà, Số nhà, Đường, Phường/Xã, Quận/Huyện"
                  className={`input input-bordered input-sm sm:input-md w-full ${formErrors.address ? "input-error" : ""}`}
                />
                {formErrors.address && <span className="text-error text-2xs">{formErrors.address}</span>}
              </div>

              {/* Điện thoại & Email */}
              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">Số điện thoại liên hệ</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="028 3822 9999"
                  className="input input-bordered input-sm sm:input-md w-full"
                />
              </div>

              <div className="form-control space-y-1">
                <label className="label py-0">
                  <span className="label-text text-xs font-bold text-base-content/80">Email nhận thông báo</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.example"
                  className="input input-bordered input-sm sm:input-md w-full"
                />
              </div>
            </div>

            {/* ── Drag & Drop File Upload ─────────────────────────────────────── */}
            <div className="pt-2 space-y-2">
              <label className="label py-0">
                <span className="label-text text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Tệp Giấy phép đăng ký kinh doanh (GPKD)</span>
                  <span className="text-error">*</span>
                </span>
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-box p-6 sm:p-8 text-center transition-all duration-150 ${
                  dragActive
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-base-300 hover:border-primary/50 bg-base-200/40"
                }`}
              >
                <input
                  type="file"
                  id="license-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-primary">{selectedFile.name}</p>
                      <p className="text-2xs text-base-content/60">
                        Dung lượng: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-error hover:underline pt-1 inline-block"
                      >
                        Chọn tệp khác
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-xs sm:text-sm text-base-content">
                        Kéo thả tệp vào đây, hoặc{" "}
                        <label
                          htmlFor="license-file-input"
                          className="text-primary hover:underline font-bold cursor-pointer"
                        >
                          Duyệt tìm tệp
                        </label>
                      </p>
                      <p className="text-2xs text-base-content/50">
                        Định dạng hỗ trợ: PDF, JPG, PNG, WEBP (Tối đa 10 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {formErrors.file && <span className="text-error text-2xs block">{formErrors.file}</span>}

              {/* View current license file link if existing */}
              {licenseUrl && (
                <div className="flex items-center gap-2 text-xs text-base-content/70 pt-1">
                  <Info className="w-3.5 h-3.5 text-info" />
                  <span>Hồ sơ hiện tại đã có tệp GPKD:</span>
                  <a
                    href={licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Xem tệp đã tải lên</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-base-200">
              {isResubmitting && (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Hủy bỏ
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || isPending}
                className="btn btn-primary btn-sm sm:btn-md px-6 text-white font-bold gap-2 shadow-xs"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isResubmitting ? "Cập nhật hồ sơ xác thực" : "Gửi hồ sơ thẩm định"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyVerificationPage;
