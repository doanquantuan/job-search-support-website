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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Mức lương kỳ vọng (VNĐ / tháng)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                step="500000"
                placeholder="Tối thiểu (vd: 15000000)"
                {...register("expectedSalaryMin")}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {errors.expectedSalaryMin && (
                <p className="text-xs text-red-500 mt-1">
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
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {errors.expectedSalaryMax && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.expectedSalaryMax.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Địa điểm làm việc */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Địa điểm mong muốn
          </label>
          <input
            type="text"
            placeholder="Ví dụ: TP. Hồ Chí Minh hoặc Remote, Hà Nội..."
            {...register("preferredLocation")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Mục tiêu nghề nghiệp */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Mục tiêu phát triển nghề nghiệp
            </label>
            <span className="text-2xs text-gray-400">{goalChars}/1000</span>
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Chia sẻ định hướng ngắn hạn, dài hạn và các giá trị bạn muốn mang lại..."
            {...register("careerGoal")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
          {errors.careerGoal && (
            <p className="text-xs text-red-500 mt-1">{errors.careerGoal.message}</p>
          )}
        </div>

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
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};
