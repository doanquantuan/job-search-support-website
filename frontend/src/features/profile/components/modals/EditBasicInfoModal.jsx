import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  contactEmail: z.string().email("Email không hợp lệ").or(z.literal("")).optional(),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (10 số)")
    .or(z.literal(""))
    .optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  githubUrl: z
    .string()
    .refine((val) => !val || val.startsWith("https://github.com/"), {
      message: "Link GitHub phải bắt đầu bằng https://github.com/",
    })
    .optional(),
});

export const EditBasicInfoModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      fullName: "",
      gender: "MALE",
      contactEmail: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      githubUrl: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || "",
        gender: initialData.gender || "MALE",
        contactEmail: initialData.contactEmail || "",
        phone: initialData.phone || "",
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split("T")[0] : "",
        address: initialData.address || "",
        githubUrl: initialData.githubUrl || "",
      });
    }
  }, [initialData, reset]);

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
      title="Chỉnh sửa thông tin cơ bản"
      subtitle="Cập nhật thông tin hiển thị trên hồ sơ của bạn"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Nguyễn Minh Anh"
            {...register("fullName")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Giới tính
          </label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                value="MALE"
                {...register("gender")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              Nam
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                value="FEMALE"
                {...register("gender")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              Nữ
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                value="OTHER"
                {...register("gender")}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              Khác
            </label>
          </div>
        </div>

        {/* Email & Điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email liên hệ
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              {...register("contactEmail")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              placeholder="0903 123 456"
              {...register("phone")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Ngày sinh */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Ngày sinh
          </label>
          <input
            type="date"
            {...register("dateOfBirth")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Địa chỉ
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
            {...register("address")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* GitHub link */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Link GitHub
          </label>
          <input
            type="text"
            placeholder="https://github.com/username"
            {...register("githubUrl")}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {errors.githubUrl && (
            <p className="text-xs text-red-500 mt-1">{errors.githubUrl.message}</p>
          )}
        </div>

        {/* Action Buttons */}
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
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};
