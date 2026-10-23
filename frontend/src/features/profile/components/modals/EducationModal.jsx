import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const educationSchema = z
  .object({
    institution: z.string().min(1, "Vui lòng nhập tên cơ sở đào tạo / trường học"),
    major: z.string().min(1, "Vui lòng nhập chuyên ngành đào tạo"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().optional(),
    description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
      path: ["endDate"],
    }
  );

export const EducationModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      major: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        institution: initialData.institution || "",
        major: initialData.major || "",
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        description: initialData.description || "",
      });
    } else {
      reset({
        institution: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  }, [initialData, mode, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      endDate: data.endDate ? data.endDate : null,
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
      title={mode === "create" ? "Thêm học vấn" : "Chỉnh sửa học vấn"}
      subtitle="Thêm thông tin quá trình học tập và đào tạo của bạn"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Cơ sở đào tạo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đại học Bách khoa TP. Hồ Chí Minh"
            {...register("institution")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.institution && (
            <p className="text-xs text-red-500 mt-1">{errors.institution.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Chuyên ngành <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Công nghệ thông tin - Khoa học máy tính"
            {...register("major")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.major && (
            <p className="text-xs text-red-500 mt-1">{errors.major.message}</p>
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
              Thời gian kết thúc (để trống nếu đang học)
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
            />
            {errors.endDate && (
              <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mô tả thêm / Thành tích nổi bật
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả tóm tắt quá trình học tập, xếp loại tốt nghiệp, học bổng..."
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
