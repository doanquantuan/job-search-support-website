import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const awardSchema = z.object({
  awardName: z.string().min(1, "Vui lòng nhập tên giải thưởng"),
  issuer: z.string().optional(),
  awardDate: z.string().min(1, "Vui lòng chọn ngày nhận giải"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
});

export const AwardModal = ({
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
    resolver: zodResolver(awardSchema),
    defaultValues: {
      awardName: "",
      issuer: "",
      awardDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        awardName: initialData.awardName || "",
        issuer: initialData.issuer || "",
        awardDate: initialData.awardDate ? initialData.awardDate.split("T")[0] : "",
        description: initialData.description || "",
      });
    } else {
      reset({
        awardName: "",
        issuer: "",
        awardDate: "",
        description: "",
      });
    }
  }, [initialData, mode, reset]);

  const onSubmit = async (data) => {
    const success = await onSave(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={mode === "create" ? "Thêm giải thưởng" : "Chỉnh sửa giải thưởng"}
      subtitle="Ghi danh các thành tích và giải thưởng bạn đạt được"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tên giải thưởng / Danh hiệu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Lập trình viên xuất sắc năm 2023..."
            {...register("awardName")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.awardName && (
            <p className="text-xs text-red-500 mt-1">{errors.awardName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Đơn vị / Tổ chức trao giải
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đại học Bách khoa TP. Hồ Chí Minh..."
            {...register("issuer")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Ngày / Năm nhận giải <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("awardDate")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
          />
          {errors.awardDate && (
            <p className="text-xs text-red-500 mt-1">{errors.awardDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mô tả chi tiết giải thưởng
          </label>
          <textarea
            rows={2}
            placeholder="Hạng mục dự thi, quy mô cuộc thi..."
            {...register("description")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
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
