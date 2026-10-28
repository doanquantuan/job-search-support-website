import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const experienceSchema = z
  .object({
    companyName: z.string().min(1, "Vui lòng nhập tên công ty"),
    position: z.string().min(1, "Vui lòng nhập vị trí đảm nhiệm"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrent && data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
      path: ["endDate"],
    }
  );

export const ExperienceModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
  onSave,
}) => {
  const [isCurrentWork, setIsCurrentWork] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      companyName: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      const isCurrent = !initialData.endDate;
      setIsCurrentWork(isCurrent);
      reset({
        companyName: initialData.companyName || "",
        position: initialData.position || "",
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        isCurrent: isCurrent,
        description: initialData.description || "",
      });
    } else {
      setIsCurrentWork(false);
      reset({
        companyName: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      });
    }
  }, [initialData, mode, reset]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsCurrentWork(checked);
    setValue("isCurrent", checked);
    if (checked) {
      setValue("endDate", "");
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      companyName: data.companyName,
      position: data.position,
      startDate: data.startDate,
      endDate: isCurrentWork ? null : data.endDate || null,
      description: data.description || "",
    };

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={mode === "create" ? "Thêm kinh nghiệm làm việc" : "Chỉnh sửa kinh nghiệm làm việc"}
      subtitle="Chia sẻ các vị trí và công ty bạn từng công tác"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tên công ty / Doanh nghiệp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: FPT Software, TechFlow..."
            {...register("companyName")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.companyName && (
            <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Vị trí / Chức danh <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Frontend Developer, UI/UX Designer..."
            {...register("position")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.position && (
            <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Thời gian kết thúc
            </label>
            <input
              type="date"
              disabled={isCurrentWork}
              {...register("endDate")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.endDate && (
              <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrentWork}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            Tôi hiện đang làm việc tại đây
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mô tả công việc & Đóng góp chính
          </label>
          <textarea
            rows={3}
            placeholder="Nêu trách nhiệm chính, các công nghệ sử dụng và kết quả đạt được..."
            {...register("description")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "create" ? "Thêm mới" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
