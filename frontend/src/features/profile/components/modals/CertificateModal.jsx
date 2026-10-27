import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const certificateSchema = z
  .object({
    certificateName: z.string().min(1, "Vui lòng nhập tên chứng chỉ"),
    issuer: z.string().min(1, "Vui lòng nhập nơi cấp / tổ chức cấp"),
    issueDate: z.string().min(1, "Vui lòng chọn ngày cấp"),
    expiryDate: z.string().optional(),
    isNeverExpires: z.boolean().optional(),
    description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  })
  .refine(
    (data) => {
      if (!data.isNeverExpires && data.issueDate && data.expiryDate) {
        return new Date(data.expiryDate) >= new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Ngày hết hạn phải sau ngày cấp",
      path: ["expiryDate"],
    }
  );

export const CertificateModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
  onSave,
}) => {
  const [isNeverExpires, setIsNeverExpires] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateName: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      isNeverExpires: false,
      description: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      const never = !initialData.expiryDate;
      setIsNeverExpires(never);
      reset({
        certificateName: initialData.certificateName || "",
        issuer: initialData.issuer || "",
        issueDate: initialData.issueDate ? initialData.issueDate.split("T")[0] : "",
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split("T")[0] : "",
        isNeverExpires: never,
        description: initialData.description || "",
      });
    } else {
      setIsNeverExpires(false);
      reset({
        certificateName: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        isNeverExpires: false,
        description: "",
      });
    }
  }, [initialData, mode, reset]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsNeverExpires(checked);
    setValue("isNeverExpires", checked);
    if (checked) {
      setValue("expiryDate", "");
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      certificateName: data.certificateName,
      issuer: data.issuer,
      issueDate: data.issueDate,
      expiryDate: isNeverExpires ? null : data.expiryDate || null,
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
      title={mode === "create" ? "Thêm chứng chỉ" : "Chỉnh sửa chứng chỉ"}
      subtitle="Thêm các văn bằng, chứng chỉ chuyên môn bạn đã đạt được"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tên chứng chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Chứng chỉ tiếng Anh B1, AWS Certified..."
            {...register("certificateName")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.certificateName && (
            <p className="text-xs text-red-500 mt-1">{errors.certificateName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nơi cấp / Đơn vị cấp chứng chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đại học Ngoại thương, TechView Academy..."
            {...register("issuer")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.issuer && (
            <p className="text-xs text-red-500 mt-1">{errors.issuer.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ngày cấp <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("issueDate")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
            />
            {errors.issueDate && (
              <p className="text-xs text-red-500 mt-1">{errors.issueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ngày hết hạn
            </label>
            <input
              type="date"
              disabled={isNeverExpires}
              {...register("expiryDate")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.expiryDate && (
              <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isNeverExpires}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            Chứng chỉ này không có thời hạn
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mô tả bổ sung / Điểm số
          </label>
          <textarea
            rows={2}
            placeholder="Điểm số đạt được hoặc đường dẫn xác thực chứng chỉ..."
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
