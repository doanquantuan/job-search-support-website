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
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Họ và tên <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Nguyễn Minh Anh"
            {...register("fullName")}
            className="input input-bordered w-full h-10 text-sm focus:input-primary"
          />
          {errors.fullName && (
            <p className="text-xs text-error mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Giới tính
            </span>
          </label>
          <div className="flex items-center gap-6">
            <label className="label cursor-pointer gap-2 justify-start">
              <input
                type="radio"
                value="MALE"
                {...register("gender")}
                className="radio radio-primary radio-sm"
              />
              <span className="label-text text-sm">Nam</span>
            </label>
            <label className="label cursor-pointer gap-2 justify-start">
              <input
                type="radio"
                value="FEMALE"
                {...register("gender")}
                className="radio radio-primary radio-sm"
              />
              <span className="label-text text-sm">Nữ</span>
            </label>
            <label className="label cursor-pointer gap-2 justify-start">
              <input
                type="radio"
                value="OTHER"
                {...register("gender")}
                className="radio radio-primary radio-sm"
              />
              <span className="label-text text-sm">Khác</span>
            </label>
          </div>
        </div>

        {/* Email & Điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm font-semibold text-base-content">
                Email liên hệ
              </span>
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              {...register("contactEmail")}
              className="input input-bordered w-full h-10 text-sm focus:input-primary"
            />
            {errors.contactEmail && (
              <p className="text-xs text-error mt-1">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-sm font-semibold text-base-content">
                Số điện thoại
              </span>
            </label>
            <input
              type="text"
              placeholder="0903 123 456"
              {...register("phone")}
              className="input input-bordered w-full h-10 text-sm focus:input-primary"
            />
            {errors.phone && (
              <p className="text-xs text-error mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Ngày sinh */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Ngày sinh
            </span>
          </label>
          <input
            type="date"
            {...register("dateOfBirth")}
            className="input input-bordered w-full h-10 text-sm focus:input-primary"
          />
        </div>

        {/* Địa chỉ */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Địa chỉ
            </span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
            {...register("address")}
            className="input input-bordered w-full h-10 text-sm focus:input-primary"
          />
        </div>

        {/* GitHub link */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Link GitHub
            </span>
          </label>
          <input
            type="text"
            placeholder="https://github.com/username"
            {...register("githubUrl")}
            className="input input-bordered w-full h-10 text-sm focus:input-primary"
          />
          {errors.githubUrl && (
            <p className="text-xs text-error mt-1">{errors.githubUrl.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="btn btn-outline border-base-300 h-10 min-h-10 px-4 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary h-10 min-h-10 px-5 text-sm font-semibold text-white gap-2"
          >
            {isSubmitting && <span className="loading loading-spinner loading-xs" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};
