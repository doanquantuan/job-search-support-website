import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const projectSchema = z
  .object({
    projectName: z.string().min(1, "Vui lòng nhập tên dự án"),
    position: z.string().min(1, "Vui lòng nhập vai trò của bạn trong dự án"),
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

export const ProjectModal = ({
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
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        projectName: initialData.projectName || "",
        position: initialData.position || "",
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        description: initialData.description || "",
      });
    } else {
      reset({
        projectName: "",
        position: "",
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
      title={mode === "create" ? "Thêm dự án" : "Chỉnh sửa dự án"}
      subtitle="Giới thiệu các dự án tiêu biểu bạn từng tham gia thực hiện"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tên dự án <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Dashboard quản lý tuyển dụng, E-commerce App..."
            {...register("projectName")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.projectName && (
            <p className="text-xs text-red-500 mt-1">{errors.projectName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Vai trò / Vị trí đảm nhiệm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Frontend Lead, Fullstack Developer..."
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
              Thời gian kết thúc (để trống nếu đang phát triển)
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
            Mô tả dự án & Công nghệ sử dụng
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả mục tiêu dự án, công nghệ ứng dụng, đóng góp của bạn..."
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
