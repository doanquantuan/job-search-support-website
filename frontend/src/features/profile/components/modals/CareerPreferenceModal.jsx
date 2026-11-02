import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";

const careerSchema = z
  .object({
    expectedSalaryMin: z.coerce.number().min(0).optional().nullable(),
    expectedSalaryMax: z.coerce.number().min(0).optional().nullable(),
    preferredLocation: z.string().optional(),
    careerGoal: z.string().max(1000, "Mục tiêu tối đa 1000 ký tự").optional(),
  })
  .refine(
    (data) => {
      if (
        data.expectedSalaryMin != null &&
        data.expectedSalaryMax != null &&
        data.expectedSalaryMax > 0
      ) {
        return data.expectedSalaryMax >= data.expectedSalaryMin;
      }
      return true;
    },
    {
      message: "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu",
      path: ["expectedSalaryMax"],
    }
  );

export const CareerPreferenceModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [goalChars, setGoalChars] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      expectedSalaryMin: "",
      expectedSalaryMax: "",
      preferredLocation: "",
      careerGoal: "",
    },
  });

  const currentGoal = watch("careerGoal");
  useEffect(() => {
    setGoalChars(currentGoal ? currentGoal.length : 0);
  }, [currentGoal]);

  useEffect(() => {
    if (initialData) {
      reset({
        expectedSalaryMin: initialData.expectedSalaryMin ?? "",
        expectedSalaryMax: initialData.expectedSalaryMax ?? "",
        preferredLocation: initialData.preferredLocation || "",
        careerGoal: initialData.careerGoal || "",
      });
      setGoalChars(initialData.careerGoal ? initialData.careerGoal.length : 0);
    } else {
      reset({
        expectedSalaryMin: "",
        expectedSalaryMax: "",
        preferredLocation: "",
        careerGoal: "",
      });
      setGoalChars(0);
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    const payload = {
      expectedSalaryMin: data.expectedSalaryMin ? Number(data.expectedSalaryMin) : null,
      expectedSalaryMax: data.expectedSalaryMax ? Number(data.expectedSalaryMax) : null,
      preferredLocation: data.preferredLocation || null,
      careerGoal: data.careerGoal || null,
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
      title="Mục tiêu nghề nghiệp"
      subtitle="Thiết lập kỳ vọng công việc và định hướng phát triển bản thân"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Lương kỳ vọng */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Mức lương kỳ vọng (VNĐ / tháng)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                step="500000"
                placeholder="Tối thiểu (vd: 15000000)"
                {...register("expectedSalaryMin")}
                className="input input-bordered w-full h-10 text-sm focus:input-primary"
              />
              {errors.expectedSalaryMin && (
                <p className="text-xs text-error mt-1">
                  {errors.expectedSalaryMin.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="number"
                step="500000"
                placeholder="Tối đa (vd: 25000000)"
                {...register("expectedSalaryMax")}
                className="input input-bordered w-full h-10 text-sm focus:input-primary"
              />
              {errors.expectedSalaryMax && (
                <p className="text-xs text-error mt-1">
                  {errors.expectedSalaryMax.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Địa điểm làm việc */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Địa điểm mong muốn
            </span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: TP. Hồ Chí Minh hoặc Remote, Hà Nội..."
            {...register("preferredLocation")}
            className="input input-bordered w-full h-10 text-sm focus:input-primary"
          />
        </div>

        {/* Mục tiêu nghề nghiệp */}
        <div className="form-control w-full">
          <div className="label py-1">
            <span className="label-text text-sm font-semibold text-base-content">
              Mục tiêu phát triển nghề nghiệp
            </span>
            <span className="label-text-alt text-2xs text-base-content/50">{goalChars}/1000</span>
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Chia sẻ định hướng ngắn hạn, dài hạn và các giá trị bạn muốn mang lại..."
            {...register("careerGoal")}
            className="textarea textarea-bordered w-full text-sm focus:textarea-primary resize-none"
          />
          {errors.careerGoal && (
            <p className="text-xs text-error mt-1">{errors.careerGoal.message}</p>
          )}
        </div>

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
