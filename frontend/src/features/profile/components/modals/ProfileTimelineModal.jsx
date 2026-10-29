import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

// Cấu hình linh hoạt cho từng loại thẻ
const TIMELINE_CONFIGS = {
  education: {
    title: "học vấn",
    primaryKey: "institution",
    primaryLabel: "Cơ sở đào tạo",
    primaryPlaceholder: "Ví dụ: Đại học Bách khoa TP. Hồ Chí Minh",
    secondaryKey: "major",
    secondaryLabel: "Chuyên ngành",
    secondaryPlaceholder: "Ví dụ: Công nghệ thông tin - Khoa học máy tính",
    secondaryRequired: true,
    startDateKey: "startDate",
    startDateLabel: "Thời gian bắt đầu",
    endDateKey: "endDate",
    endDateLabel: "Thời gian kết thúc",
    hasEndDate: true,
    hasCurrentCheckbox: false,
    descPlaceholder: "Mô tả tóm tắt quá trình học tập, xếp loại tốt nghiệp, học bổng...",
  },
  experience: {
    title: "kinh nghiệm làm việc",
    primaryKey: "companyName",
    primaryLabel: "Tên công ty",
    primaryPlaceholder: "Ví dụ: FPT Software, VNG Corporation...",
    secondaryKey: "position",
    secondaryLabel: "Vị trí đảm nhiệm",
    secondaryPlaceholder: "Ví dụ: Senior Frontend Developer",
    secondaryRequired: true,
    startDateKey: "startDate",
    startDateLabel: "Thời gian bắt đầu",
    endDateKey: "endDate",
    endDateLabel: "Thời gian kết thúc",
    hasEndDate: true,
    hasCurrentCheckbox: true,
    currentCheckboxLabel: "Tôi đang làm việc tại đây",
    descPlaceholder: "Mô tả công việc, dự án tham gia, công nghệ sử dụng và kết quả đạt được...",
  },
  project: {
    title: "dự án",
    primaryKey: "projectName",
    primaryLabel: "Tên dự án",
    primaryPlaceholder: "Ví dụ: Website thương mại điện tử E-Shop",
    secondaryKey: "position",
    secondaryLabel: "Vai trò trong dự án",
    secondaryPlaceholder: "Ví dụ: Trưởng nhóm phát triển / Fullstack Dev",
    secondaryRequired: true,
    startDateKey: "startDate",
    startDateLabel: "Thời gian bắt đầu",
    endDateKey: "endDate",
    endDateLabel: "Thời gian kết thúc",
    hasEndDate: true,
    hasCurrentCheckbox: true,
    currentCheckboxLabel: "Dự án đang thực hiện",
    descPlaceholder: "Mô tả tổng quan dự án, quy mô thành viên, công nghệ chính và đóng góp cá nhân...",
  },
  certificate: {
    title: "chứng chỉ",
    primaryKey: "certificateName",
    primaryLabel: "Tên chứng chỉ",
    primaryPlaceholder: "Ví dụ: AWS Certified Solutions Architect, IELTS 7.5...",
    secondaryKey: "issuer",
    secondaryLabel: "Nơi cấp / Tổ chức cấp",
    secondaryPlaceholder: "Ví dụ: Amazon Web Services, British Council...",
    secondaryRequired: true,
    startDateKey: "issueDate",
    startDateLabel: "Ngày cấp",
    endDateKey: "expiryDate",
    endDateLabel: "Ngày hết hạn",
    hasEndDate: true,
    hasCurrentCheckbox: true,
    currentCheckboxLabel: "Chứng chỉ không có thời hạn",
    descPlaceholder: "Thông tin bổ sung, mã số chứng chỉ, đường dẫn xác minh...",
  },
  award: {
    title: "giải thưởng",
    primaryKey: "awardName",
    primaryLabel: "Tên giải thưởng / Danh hiệu",
    primaryPlaceholder: "Ví dụ: Nhân viên xuất sắc năm 2023, Giải nhất Hackathon...",
    secondaryKey: "issuer",
    secondaryLabel: "Đơn vị trao giải",
    secondaryPlaceholder: "Ví dụ: Tập đoàn Viettel, Ban tổ chức cuộc thi...",
    secondaryRequired: false,
    startDateKey: "awardDate",
    startDateLabel: "Ngày nhận giải",
    hasEndDate: false,
    hasCurrentCheckbox: false,
    descPlaceholder: "Mô tả thêm về giải thưởng, thành tích đạt được...",
  },
};

// Tạo Zod schema động dựa theo type
const createTimelineSchema = (cfg) => {
  let shape = {
    primary: z.string().min(1, `Vui lòng nhập ${cfg.primaryLabel.toLowerCase()}`),
    secondary: cfg.secondaryRequired
      ? z.string().min(1, `Vui lòng nhập ${cfg.secondaryLabel.toLowerCase()}`)
      : z.string().optional(),
    startDate: z.string().min(1, `Vui lòng chọn ${cfg.startDateLabel.toLowerCase()}`),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  };

  return z.object(shape).refine(
    (data) => {
      if (cfg.hasEndDate && !data.isCurrent && data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: `${cfg.endDateLabel || "Ngày kết thúc"} phải sau hoặc bằng ${cfg.startDateLabel.toLowerCase()}`,
      path: ["endDate"],
    }
  );
};

export const ProfileTimelineModal = ({
  isOpen,
  onClose,
  type = "education", // "education" | "experience" | "project" | "certificate" | "award"
  mode = "create",
  initialData,
  onSave,
}) => {
  const cfg = TIMELINE_CONFIGS[type] || TIMELINE_CONFIGS.education;
  const [isCurrent, setIsCurrent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTimelineSchema(cfg)),
    defaultValues: {
      primary: "",
      secondary: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    },
  });

  // Tự động gán dữ liệu ban đầu khi sửa hoặc reset khi tạo mới
  useEffect(() => {
    if (!isOpen) return;

    if (initialData && mode === "edit") {
      const startVal = initialData[cfg.startDateKey];
      const endVal = cfg.hasEndDate ? initialData[cfg.endDateKey] : "";
      const currentFlag = cfg.hasCurrentCheckbox ? !endVal : false;

      setIsCurrent(currentFlag);
      reset({
        primary: initialData[cfg.primaryKey] || "",
        secondary: initialData[cfg.secondaryKey] || "",
        startDate: startVal ? startVal.split("T")[0] : "",
        endDate: endVal ? endVal.split("T")[0] : "",
        isCurrent: currentFlag,
        description: initialData.description || "",
      });
    } else {
      setIsCurrent(false);
      reset({
        primary: "",
        secondary: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      });
    }
  }, [initialData, mode, reset, isOpen, type, cfg]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsCurrent(checked);
    setValue("isCurrent", checked);
    if (checked) {
      setValue("endDate", "");
    }
  };

  const onSubmit = async (data) => {
    // Chuyển đổi ngược lại payload đúng với format backend yêu cầu
    const payload = {
      [cfg.primaryKey]: data.primary,
      [cfg.secondaryKey]: data.secondary || "",
      [cfg.startDateKey]: data.startDate,
      description: data.description || "",
    };

    if (cfg.hasEndDate) {
      payload[cfg.endDateKey] = isCurrent ? null : data.endDate || null;
    }

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  const modalTitle = mode === "create" ? `Thêm ${cfg.title}` : `Chỉnh sửa ${cfg.title}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={modalTitle}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Trường chính (Tên trường / Tên công ty / Tên dự án / ...) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {cfg.primaryLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder={cfg.primaryPlaceholder}
            {...register("primary")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {errors.primary && (
            <p className="text-xs text-red-500 mt-1">{errors.primary.message}</p>
          )}
        </div>

        {/* Trường phụ (Chuyên ngành / Vị trí / Nơi cấp / ...) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {cfg.secondaryLabel} {cfg.secondaryRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder={cfg.secondaryPlaceholder}
            {...register("secondary")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {errors.secondary && (
            <p className="text-xs text-red-500 mt-1">{errors.secondary.message}</p>
          )}
        </div>

        {/* Thời gian */}
        <div className={`grid grid-cols-1 ${cfg.hasEndDate ? "sm:grid-cols-2" : ""} gap-4`}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {cfg.startDateLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {cfg.hasEndDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {cfg.endDateLabel}
              </label>
              <input
                type="date"
                disabled={isCurrent}
                {...register("endDate")}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Checkbox hiện tại / không thời hạn (nếu có) */}
        {cfg.hasCurrentCheckbox && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="timeline-current"
              checked={isCurrent}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="timeline-current" className="text-xs font-medium text-gray-700 cursor-pointer">
              {cfg.currentCheckboxLabel}
            </label>
          </div>
        )}

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Mô tả thêm / Thành tích nổi bật
          </label>
          <textarea
            rows={3}
            placeholder={cfg.descPlaceholder}
            {...register("description")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "create" ? "Thêm mới" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

